#include <atomic>
#include <chrono>
#include <cstdlib>
#include <mutex>
#include <nlohmann/json.hpp>
#include <queue>
#include <string>
#include <thread>

#include "buttons_overlay_target.h"
#include "cdll_interfaces.h"
#include "gameinfo.h"
#include "icvar.h"
#include "library.h"
#include "log.h"
#include "net_messages.h"
#include "overlay.h"
#include "overlay_positions.h"
#include "playback_cameras.h"
#include "playback_overlay.h"
#include "player_controllers.h"
#include "player_names.h"
#include "player_voices.h"
#include "plugin.h"
#include "sequences.h"
#include "settings.h"
#include "tier0/convar.h"
#include "tier0/icommandline.h"
#include "tier0/platform.h"
#include "user_commands.h"
#include "voice_activity.h"
#include "vtable.h"
#include "websocket.h"
#ifdef _WIN32
#include <windows.h>
#define SERVER_LIB_PATH "\\csgo\\bin\\win64\\server.dll"
#else
#include <unistd.h>

#include <csignal>
#include <cstdio>
#define SERVER_LIB_PATH "/csgo/bin/linuxsteamrt64/libserver.so"
#endif

using nlohmann::json;
using std::string;

#include <cstring>

typedef bool (*AppSystemConnectFn)(IAppSystem* appSystem, CreateInterfaceFn factory);
typedef void (*AppSystemShutdownFn)(IAppSystem* appSystem);
typedef void (*FrameStageNotifyFn)(void* thisptr, ClientFrameStage_t curStage);
typedef void (*ClientFullyConnectFn)(void* thisptr, int playerSlot);

AppSystemConnectFn serverConfigConnect = NULL;
ClientFullyConnectFn originalClientFullyConnect = NULL;
AppSystemShutdownFn serverConfigShutdown = NULL;
CreateInterfaceFn serverCreateInterface = NULL;
ISource2EngineToClient* engineToClient = NULL;
ISource2Client* client = NULL;
FrameStageNotifyFn originalFrameStageNotify = NULL;
// Slot of ISource2Client::FrameStageNotify (cdll_interfaces.h). The method queues a lambda on the thread pool, and the
// job class generated for that lambda is local to the method, so its typeinfo name embeds
// "14CSource2Client16FrameStageNotifyE". The only CSource2Client virtual that references the vtable of that class,
// i.e. constructs the job, is at this slot.
constexpr int frameStageNotifyVtableIndex = 36;
// Slot of ISource2GameClients::ClientFullyConnect, the method that fires the "player_connect_full" game event.
constexpr int clientFullyConnectVtableIndex = 15;
ICvar* g_pCVar = NULL;
static const char* demoPath = NULL;
std::atomic<bool> isQuitting{false};
bool shouldDeleteLogFile = true;
std::mutex pendingCommandsMutex;
std::queue<std::string> pendingCommands;
std::atomic<bool> captureInProgress{false};
std::chrono::steady_clock::time_point captureStartTime;
std::chrono::steady_clock::time_point startTime = std::chrono::steady_clock::now();

static void UnhideCommandsAndCvars() {
    uint64 flagsToRemove = (FCVAR_HIDDEN | FCVAR_DEVELOPMENTONLY);

    ConCommandData* data = g_pCVar->GetConCommandData(ConCommandRef());
    for (ConCommandRef concmd = ConCommandRef((uint16)0); concmd.GetRawData() != data;
         concmd = ConCommandRef(concmd.GetAccessIndex() + 1)) {
        if (concmd.GetFlags() & flagsToRemove) {
            concmd.RemoveFlags(flagsToRemove);
        }
    }

    for (ConVarRefAbstract ref(ConVarRef((uint16)0)); ref.IsValidRef();
         ref = ConVarRefAbstract(ConVarRef(ref.GetAccessIndex() + 1))) {
        if (ref.GetFlags() & flagsToRemove) {
            ref.RemoveFlags(flagsToRemove);
        }
    }
}

void QueueEngineCommand(const std::string& cmd) {
    std::lock_guard<std::mutex> lock(pendingCommandsMutex);
    pendingCommands.push(cmd);
}
ISource2EngineToClient* GetEngine() {
    if (engineToClient != NULL) {
        return engineToClient;
    }

    if (factory == NULL) {
        return NULL;
    }

    engineToClient = (ISource2EngineToClient*)factory("Source2EngineToClient001", NULL);

    return engineToClient;
}

void NewFrameStageNotify(void* thisptr, ClientFrameStage_t stage) {
    if (isQuitting) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    // The replaced names go in just before the frame is drawn: the game fills the names of the player controllers from
    // the demo as it applies the network updates, which happens earlier in the frame.
    if (stage == ClientFrameStage_t::FRAME_RENDER_START) {
        ApplyReplacedPlayerNames();
    }

    if (stage != ClientFrameStage_t::FRAME_START) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    auto engine = GetEngine();
    if (engine == NULL) {
        Log("Engine interface not found");
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    // The overlay hooks are installed here, on the game thread once the client is up, the first time a panel has
    // something to draw. Convar callbacks and commands that show panels can run during Connect, before the renderer
    // exists, so they only set the visibility. The voice indicator is on by default, so it only counts once someone
    // talks.
    static bool wasAnyPanelVisible = false;
    bool isAnyPanelVisible = IsAnyPanelVisible();
    if (isAnyPanelVisible && !wasAnyPanelVisible) {
        InstallOverlay();
    }
    wasAnyPanelVisible = isAnyPanelVisible;

    // The commands run outside the mutex: holding it would deadlock with the render thread queuing a command.
    std::queue<std::string> commandsToExecute;
    {
        std::lock_guard<std::mutex> lock(pendingCommandsMutex);
        commandsToExecute.swap(pendingCommands);
    }
    while (!commandsToExecute.empty()) {
        std::string cmd = commandsToExecute.front();
        commandsToExecute.pop();
        Log("Executing queued command: %s", cmd.c_str());
        engine->ExecuteClientCmd(0, cmd.c_str(), true);
        Log("Executed queued command: %s", cmd.c_str());
    }

    UpdateOverlayPositionConVars();
    UpdateSettingsFile();

    // Workaround to start demo playback when Steam is in offline mode, the +playdemo launch option doesn't work in this
    // case.
    if (demoPath != NULL) {
        if (engine->IsPlayingDemo()) {
            // The launch option worked. Kept armed, the workaround would replay the demo as soon as the playback is
            // ended with the disconnect command.
            demoPath = NULL;
        } else {
            auto now = std::chrono::steady_clock::now();
            auto secondsSinceStart = std::chrono::duration_cast<std::chrono::seconds>(now - startTime).count();
            if (secondsSinceStart >= 8) {
                string cmd = "playdemo \"" + string(demoPath) + "\"";
                demoPath = NULL;
                Log("Force playing demo: %s", cmd.c_str());
                engine->ExecuteClientCmd(0, cmd.c_str(), true);
                Log("Forced playing demo: %s", cmd.c_str());
            }
        }
    }

    // Handle capture-player-view delayed endmovie
    if (captureInProgress) {
        auto now = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(now - captureStartTime).count();
        if (elapsed >= 1000) {
            Log("Ending movie capture");
            engine->ExecuteClientCmd(0, "endmovie", true);
            captureInProgress = false;
            json responseMsg;
            responseMsg["name"] = "capture-player-view-result";
            SendMsg(responseMsg);
        }
    }

    auto demo = engine->GetDemoPlayer();
    if (demo == NULL) {
        Log("Demo player interface not found");
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    int newTick = demo->GetDemoTick();
    bool newIsPlayingDemo = engine->IsPlayingDemo();
    // The panel is reduced to a play button once the playback has ended. IsPlaybackActive is already true while a demo
    // loads, before IsPlayingDemo is, so the button doesn't linger and play the demo twice.
    isPlaybackActive = newIsPlayingDemo || demo->IsPlaybackActive();
    PlaybackState playbackState = {};
    playbackState.tick = newTick;
    playbackState.totalTicks = demo->GetTotalDemoTicks();
    playbackState.isPaused = demo->IsPlaybackPaused();
    playbackState.speed = demo->GetPlaybackTimeScale();
    SetPlaybackPanelState(playbackState);

    if (newIsPlayingDemo && !isPlayingDemo) {
        Log("[%d] Demo playback started, sequences %d", newTick, GetSequenceCount());
        // To compare with the thread the network messages are unserialized on, see NewUnserializeMessageInternal.
        Log("Frame hook thread: %llu", (unsigned long long)std::hash<std::thread::id>()(std::this_thread::get_id()));

        // Network messages may not be registered yet when the client connects, retry once playback starts.
        HookNetMessageUnserialize();
        HookFindOrCreateNetMessage();
        ResetVoiceActivity();
    } else if (!newIsPlayingDemo && isPlayingDemo) {
        Log("[%d] Demo playback stopped, sequences %d", newTick, GetSequenceCount());
        // Reset here rather than at the next playback start: the first packets of a demo, which carry the button
        // baselines, are unserialized before this hook sees IsPlayingDemo flip.
        ResetUserCommandsState();
        ResetSpectatedPlayer();
        ResetButtonsOverlayTarget();
        ResetPlayerVoicesState();
        ResetReplacedPlayerNames();
        ResetPlaybackSpectatedPlayer();
        ClearPlaybackLoop();
        ClearPlaybackSequenceStart();
    }

    isPlayingDemo = newIsPlayingDemo;
    if (!isPlayingDemo) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    RefreshSpectatedPlayer();
    UpdateButtonsOverlayTarget(newTick);
    UpdatePlayerVoicesState();
    UpdatePlaybackSpectatedPlayer();

    ProcessSequences(engine, newTick);

    currentTick = newTick;

    originalFrameStageNotify(thisptr, stage);
}

static void LoadDemoFiles(const string& demoPath) {
    LoadSequencesFile(demoPath);
    LoadPlaybackTimelineFile(demoPath);
    LoadPlaybackCamerasFile(demoPath);
    SetPlaybackDemoPath(demoPath);
}

static void HandleWebSocketMessage(const std::string& message) {
    Log("[%d] Message received: %s", currentTick.load(), message.c_str());

    try {
        json msg = json::parse(message.c_str());
        if (!msg.contains("name")) {
            return;
        }

        if (msg["name"] == "playdemo" && msg.contains("payload") && msg["payload"].is_string()) {
            string demoPath = msg["payload"];

            // Loads the files the app wrote next to the demo. The app deletes them once it gets the status.
            LoadDemoFiles(demoPath);
            SendStatusOk();

            string cmd = "playdemo \"" + demoPath + "\"";
            QueueEngineCommand(cmd);
        } else if (msg["name"] == "capture-player-view") {
            Log("Capturing player view");
            QueueEngineCommand("getposcopy");
            // The "screenshot" command works only on Windows when the -tools launch option is set.
            // As a workaround, we use the startmovie command to take a screenshot.
            QueueEngineCommand("hideconsole");
            QueueEngineCommand("startmovie csdmcamera jpg");
            captureStartTime = std::chrono::steady_clock::now();
            captureInProgress = true;
        }
    } catch (const std::exception& exception) {
        Log("Message can't be handled: %s", exception.what());
    }
}

bool Connect(IAppSystem* appSystem, CreateInterfaceFn factoryFn) {
    Log("Connect called");

    factory = factoryFn;
    bool result = serverConfigConnect(appSystem, factory);

    g_pCVar = (ICvar*)factory("VEngineCvar007", NULL);
    if (g_pCVar == NULL) {
        PluginError("Cvar interface not found.");
    }

    // Required to make the spec_lock_to_accountid command working since the 25/04/2024 update - it looks like the
    // command has been hidden. Also required to use the startmovie command.
    UnhideCommandsAndCvars();
    ConVar_Register();
    LoadSettings();

    StartWebSocketConnection(HandleWebSocketMessage);

    RestoreGameinfoFile();

    return result;
}

void Shutdown(IAppSystem* appSystem) {
    isQuitting = true;

    SaveSettings();
    RemoveOverlay();

    if (serverConfigShutdown != NULL) {
        serverConfigShutdown(appSystem);
    }

    StopWebSocketConnection();

    ConVar_Unregister();

    // Our static ConCommands unregister themselves in their destructor at plugin unload, but by then
    // the engine has already freed its cvar system, so g_pCVar is dangling and calling into it crashes
    // (Linux only). Null it here, while the cvar system is still alive, to make that a no-op.
    g_pCVar = NULL;
}

void AssertInsecureParameterIsPresent() {
    bool found = false;
    // Since the "Armory" update, calling CommandLine()->HasParm("-insecure") crashes the game when the parameter is not
    // present.
    auto parameters = CommandLine()->GetParms();
    for (int i = 0; i < CommandLine()->ParmCount(); i++) {
        if (strcmp(parameters[i], "-insecure") == 0) {
            found = true;
            break;
        }
    }

    if (!found) {
        PluginError("Plugin loaded without the -insecure launch option.");
    }
}

void NewClientFullyConnect(void* thisptr, int playerSlot) {
    Log("ClientFullyConnect: playerSlot=%d", playerSlot);
    if (client != NULL) {
        originalClientFullyConnect(thisptr, playerSlot);
        return;
    }

    // Hook FrameStageNotify to call engine commands from the engine thread since it's not thread safe to call engine
    // commands from another thread.
    client = (ISource2Client*)factory("Source2Client002", NULL);
    if (client == NULL) {
        PluginError("Source2Client002 interface not found.");
    }

    Log("Hooking FrameStageNotify");
    auto vtable = *(void***)client;
    originalFrameStageNotify = (FrameStageNotifyFn)vtable[frameStageNotifyVtableIndex];
    if (!PatchVTableEntry(vtable, frameStageNotifyVtableIndex, (void*)&NewFrameStageNotify)) {
        PluginError("Hooking FrameStageNotify failed.");
    }
    Log("Hooked FrameStageNotify");

    HookNetMessageUnserialize();
    HookFindOrCreateNetMessage();

    // Since the 23/05/2024 CS2 update, the demo playback UI is displayed by default.
    // We have to set the demo_ui_mode convar to 0 before starting the playback prevent the UI from being displayed.
    QueueEngineCommand("demo_ui_mode 0");
    QueueEngineCommand("sv_cheats 1");  // required to unlock commands such as getposcopy

    originalClientFullyConnect(thisptr, playerSlot);
}

// Dev builds only: when CSDM_WAIT_FOR_DEBUGGER is set, the first CreateInterface call waits for a debugger to attach.
#ifdef CSDM_DEV_COMMANDS
static bool IsDebuggerAttached() {
#ifdef _WIN32
    return IsDebuggerPresent();
#else
    // TracerPid is the pid of the process ptrace-attached to this one (gdb), 0 when there is none.
    FILE* status = fopen("/proc/self/status", "r");
    if (status == NULL) {
        return false;
    }

    int tracerPid = 0;
    char line[256];
    while (fgets(line, sizeof(line), status) != NULL) {
        if (sscanf(line, "TracerPid: %d", &tracerPid) == 1) {
            break;
        }
    }
    fclose(status);

    return tracerPid != 0;
#endif
}

static void WaitForDebuggerIfRequested() {
    // CreateInterface is called several times during the game boot, only the first call waits.
    static bool alreadyCalled = false;
    if (alreadyCalled || getenv("CSDM_WAIT_FOR_DEBUGGER") == NULL) {
        return;
    }
    alreadyCalled = true;

    Log("CSDM_WAIT_FOR_DEBUGGER is set, waiting for a debugger to attach to the game");
    while (!IsDebuggerAttached()) {
#ifdef _WIN32
        Sleep(100);
#else
        usleep(100 * 1000);
#endif
    }

#ifdef _WIN32
    __debugbreak();
#else
    raise(SIGTRAP);
#endif
}
#endif

EXPORT void* CreateInterface(const char* pName, int* pReturnCode) {
#ifdef CSDM_DEV_COMMANDS
    WaitForDebuggerIfRequested();
#endif

    if (shouldDeleteLogFile) {
        DeleteLogFile();
        shouldDeleteLogFile = false;
    }

    Log("CreateInterface called with %s", pName);
    if (serverCreateInterface == NULL) {
        AssertInsecureParameterIsPresent();

        gameDirectory = Plat_GetGameDirectory();
        string libPath = gameDirectory + SERVER_LIB_PATH;

        void* serverModule = LoadLib(libPath.c_str());
        if (serverModule == NULL) {
            PluginError("Could not load server lib %s: %s", libPath.c_str(), GetLastErrorString());
        }

        serverCreateInterface = (CreateInterfaceFn)GetLibAddress(serverModule, "CreateInterface");
        if (serverCreateInterface == NULL) {
            PluginError("Could not find CreateInterface: %s", GetLastErrorString());
        }
    }

    void* original = serverCreateInterface(pName, pReturnCode);
    if (original == NULL) {
        Log("serverCreateInterface returned NULL for %s", pName);
        return NULL;
    }

    auto vtable = *(void***)original;
    if (strcmp(pName, "Source2ServerConfig001") == 0) {
        serverConfigConnect = (AppSystemConnectFn)vtable[0];
        serverConfigShutdown = (AppSystemShutdownFn)vtable[4];
        if (!PatchVTableEntry(vtable, 0, (void*)&Connect) || !PatchVTableEntry(vtable, 4, (void*)&Shutdown)) {
            PluginError("Hooking Source2ServerConfig001 failed.");
        }
    } else if (strcmp(pName, "Source2GameClients001") == 0) {
        originalClientFullyConnect = (ClientFullyConnectFn)vtable[clientFullyConnectVtableIndex];
        if (!PatchVTableEntry(vtable, clientFullyConnectVtableIndex, (void*)&NewClientFullyConnect)) {
            PluginError("Hooking ClientFullyConnect failed.");
        }
    }

    if (demoPath == NULL) {
        int paramCount = CommandLine()->ParmCount();
        for (int i = 0; i < paramCount; i++) {
            const char* param = CommandLine()->GetParm(i);
            if (strcmp(param, "+playdemo") == 0 && i + 1 < paramCount) {
                demoPath = CommandLine()->GetParm(i + 1);
                LoadDemoFiles(string(demoPath));
                break;
            }
        }
    }

    return original;
}
