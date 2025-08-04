#include <thread>
#include <fstream>
#include <mutex>
#include <queue>
#include <tier1.h>
#include <easywsclient.hpp>
#include <nlohmann/json.hpp>
#ifdef _WIN32
#include <windows.h>
#define CLIENT_LIB_PATH "\\bin\\client.dll"
#elif OSX
#include <sys/mman.h>
#define CLIENT_LIB_PATH "/bin/osx64/client.dylib"
#else
#include <sys/mman.h>
#define CLIENT_LIB_PATH "/bin/linux64/client_client.so"
#endif

#include "utils.h"
#include "plugin.h"
#include "cdll_int.h"
#include "game_ui.h"

using easywsclient::WebSocket;
using nlohmann::json;
using std::string;
using std::thread;
using std::mutex;
using std::chrono::milliseconds;

struct Action {
    int tick;
    string cmd;
    bool executed;
};

struct Sequence {
    std::vector<Action> actions;
};

#ifdef _WIN32
typedef void(__stdcall *FrameStageNotifyFn) (CClientFrameStage);
#else
typedef void (*FrameStageNotifyFn)(void*, CClientFrameStage);
#endif

CServerPlugin g_Plugin;
EXPOSE_SINGLE_INTERFACE_GLOBALVAR(CServerPlugin, IServerPluginCallbacks, INTERFACEVERSION_ISERVERPLUGINCALLBACKS, g_Plugin);
void* client;
IVEngineClient14* engine = NULL;
CGameUI* gameUi = NULL;
FrameStageNotifyFn originalFrameStageNotify = NULL;
thread* wsConnectionThread = NULL;
WebSocket::pointer ws;
string demoPath;
string vdfFilePath;
bool isPlayingDemo = false;
int mainMenuFrameCount = 0;
int currentTick = -1;
bool isQuitting = false;
std::queue<Sequence> sequences;
// Unlike CS2, executing client commands from a different thread than the main game thread may crash the game.
// As the WebSocket connection runs in a separate thread, we defer the possible command execution when we receive a
// WS message to the next frame of the main game thread.
// These variables are used to share the command to be executed between the WebSocket thread and the main game thread.
string pendingCmd;
mutex pendingCmdMutex;

void ExecutePendingCommand()
{
    if (pendingCmdMutex.try_lock())
    {
        if (!pendingCmd.empty())
        {
            Log("Executing command: %s", pendingCmd.c_str());
            engine->ExecuteClientCmd(pendingCmd.c_str());
            pendingCmd.clear();
        }
        pendingCmdMutex.unlock();
    }
    else
    {
        Log("Mutex locked, deferring command execution to next frame.");
    }
}

void SendStatusOk() {
    json msg;
    msg["name"] = "status";
    msg["payload"] = "ok";
    ws->send(msg.dump());
}

void LoadSequencesFile(string demoPath) {
    sequences = {};

    string demoJsonPath = demoPath + ".json";
    if (FileExists(demoJsonPath)) {
        std::ifstream jsonFile(demoJsonPath);
        json jsonSequences = json::parse(jsonFile);
        if (jsonSequences.size() == 0) {
            Log("No sequences found in JSON file");
            return;
        }

        for (auto jsonSequence : jsonSequences) {
            Sequence sequence;
            for (auto jsonAction : jsonSequence["actions"]) {
                Action action;
                action.tick = jsonAction["tick"];
                action.cmd = jsonAction["cmd"];
                action.executed = false;
                sequence.actions.push_back(action);
            }
            sequences.push(sequence);
        }

        Log("JSON sequences file loaded: %s", demoJsonPath.c_str());
    }
    else {
        Log("JSON sequences file not found at %s", demoJsonPath.c_str());
    }
}

void HandleWebSocketMessage(const string& message)
{
    json msg = json::parse(message.c_str());
    if (!msg.contains("name")) {
        return;
    }

    if (msg["name"] == "playdemo" && msg.contains("payload") && msg["payload"].is_string()) {
        SendStatusOk();

        string demoPath = msg["payload"];

        LoadSequencesFile(demoPath);

        std::lock_guard<mutex> lock(pendingCmdMutex);
        pendingCmd = "playdemo \"" + demoPath + "\"";
    }
}

void ExecuteInitialDemoPlayback() {
    // The popup "CSGO Legacy version" shown since the CS2 release prevents the demo playback to start when the game
    // starts and the +playdemo launch parameter is used.
    // As a workaround we force the demo playback once the main menu is loaded.
    // Another solution would be to add the +tv_relay launch parameter, but it spams the console with re-connection
    // messages. Thanks @dtugend for your hints on this one!
    if (demoPath.empty() || gameUi->m_CSGOGameUIState != CSGO_GAME_UI_STATE_MAINMENU) {
        return;
    }

    // Wait some frames before executing the command otherwise it may be ignored.
    if (++mainMenuFrameCount > 60)
    {
        string cmd = "playdemo \"" + demoPath + "\"";
        Log("Executing initial playdemo command: %s", cmd.c_str());
        engine->ExecuteClientCmd(cmd.c_str());
        demoPath.clear();
        mainMenuFrameCount = 0;
    }
}

void PlaybackFrame() {
    if (isQuitting)
    {
        return;
    }

    bool newIsPlayingDemo = engine->IsPlayingDemo();
    if (newIsPlayingDemo && !isPlayingDemo) {
        Log("Demo playback started %d", currentTick);
        currentTick = -1;
    }
    else if (!newIsPlayingDemo && isPlayingDemo) {
        Log("Demo playback stopped %d", currentTick);
        currentTick = -1;
    }

    isPlayingDemo = newIsPlayingDemo;
    if (!isPlayingDemo || gameUi->m_CSGOGameUIState != CSGO_GAME_UI_STATE_INGAME) {
        return;
    }

    int newTick = engine->GetDemoPlaybackTick();
    if (newTick != currentTick) {
        Sequence& currentSequence = sequences.front();
        for (auto& action : currentSequence.actions) {
            // Also check for minus 1 because some ticks may not be "seen" when fast-forwarding the playback during a few ticks.
            // Example with demo_gototick 1000: 1001 -> 1003 -> 1005 -> 1007 -> 1008 -> 1009 -> 1010...
            if (!action.executed && (action.tick == newTick || action.tick == newTick - 1)) {
                action.executed = true;
                if (action.cmd == "go_to_next_sequence") {
                    Log("Going to next sequence, remaining sequences: %d", sequences.size() - 1);
                    sequences.pop();
                    engine->ExecuteClientCmd("demo_gototick 0");
                    currentTick = -1;
                }
                else {
                    Log("%d executing: %s", newTick, action.cmd.c_str());
                    engine->ExecuteClientCmd(action.cmd.c_str());
                }
            }
        }
    }

    currentTick = newTick;
}

void ConnectToWebsocketServer() {
    Log("Connecting to WebSocket server...");
    ws = WebSocket::from_url("ws://localhost:4574?process=game");
    if (ws == NULL)
    {
        Log("Failed to connect to WebSocket server.");
        return;
    }
    
    Log("Connected to WebSocket server.");
    while (ws->getReadyState() != WebSocket::CLOSED && !isQuitting) {
        ws->poll();
        ws->dispatch(HandleWebSocketMessage);
    }

    Log("Disconnected from WebSocket server.");
    delete ws;
    ws = NULL;
}

void ConnectToWebsocketServerLoop() {
    while (true) {
        if (isQuitting) {
            break;
        }

        if (ws != NULL) {
            continue;
        }

        ConnectToWebsocketServer();

        if (ws == NULL) {
            Log("Retrying in 2s...");
            std::this_thread::sleep_for(milliseconds(2000));
        }
    }
}

CServerPlugin::CServerPlugin()
{
}

CServerPlugin::~CServerPlugin()
{
}

#ifdef _WIN32
void __stdcall NewFrameStageNotify(CClientFrameStage stage)
#else
void NewFrameStageNotify(void* thisptr, CClientFrameStage stage)
#endif
{
    ExecuteInitialDemoPlayback();
    ExecutePendingCommand();
    PlaybackFrame();

#ifdef _WIN32
    originalFrameStageNotify(stage);
#else
    originalFrameStageNotify(thisptr, stage);
#endif
}

// Called when the plugin is loaded ONLY if the -insecure launch parameter is set.
bool CServerPlugin::Load(CreateInterfaceFn interfaceFactory, CreateInterfaceFn gameServerFactory)
{
    DeleteLogFile();

    engine = (IVEngineClient14*)interfaceFactory("VEngineClient014", NULL);
    if (engine == NULL)
    {
        Log("Could not find VEngineClient014 : %s", GetLastErrorString());
        return false;
    }

    const char* gameDirectory = engine->GetGameDirectory();
    vdfFilePath = string(gameDirectory) + "/addons/csdm.vdf";
    if (FileExists(vdfFilePath))
    {
        remove(vdfFilePath.c_str());
    }

    string libPath = string(gameDirectory) + CLIENT_LIB_PATH;
    client = LoadLib(libPath.c_str());
    if (client == NULL)
    {
        Log("Could not load client lib %s : %s", libPath.c_str(), GetLastErrorString());
        return false;
    }

    auto createInterface = (CreateInterfaceFn)GetLibAddress(client, "CreateInterface");
    if (createInterface == NULL)
    {
        Log("Could not find CreateInterface : %s", GetLastErrorString());
        return false;
    }

    gameUi = (CGameUI*)createInterface("GameUI011", NULL);
    if (gameUi == NULL)
    {
        Log("Could not find GameUI011 : %s", GetLastErrorString());
        return false;
    }

    auto cClient = createInterface("VClient018", NULL);
    if (cClient == NULL)
    {
        Log("Could not find VClient018 : %s", GetLastErrorString());
        return false;
    }

    auto vtable = *(void***)cClient;
    originalFrameStageNotify = (FrameStageNotifyFn)vtable[37];

#ifdef _WIN32
    DWORD oldProtect = 0;
    if (!ChangeMemoryProtection(vtable, sizeof(void**), PAGE_EXECUTE_READWRITE, &oldProtect))
    {
        Log("VirtualProtect PAGE_EXECUTE_READWRITE failed: %d", GetLastError());
        return false;
    }

    vtable[37] = reinterpret_cast<void*>(&NewFrameStageNotify);

    DWORD ignore = 0;
    if (!ChangeMemoryProtection(vtable, sizeof(void**), oldProtect, &ignore))
    {
        Log("VirtualProtect restore failed: %d", GetLastError());
        return false;
    }
#else
    if (ChangeMemoryProtection((void*)&vtable[37], sizeof(void*), PROT_READ | PROT_WRITE | PROT_EXEC) != 0){ 
        Log("Failed to change memory protection: %s", GetLastErrorString());
        return false;
    }

    vtable[37] = reinterpret_cast<void*>(&NewFrameStageNotify);

    if (ChangeMemoryProtection((void*)&vtable[37], sizeof(void*), PROT_READ | PROT_EXEC) != 0) {
        Log("Failed to restore memory protection: %s", GetLastErrorString());
        return false;
    }
#endif


    ConnectTier1Libraries(&interfaceFactory, 1);

    MathLib_Init();
    ConVar_Register();

    int paramCount = CommandLine()->ParmCount();
    for (int i = 0; i < paramCount; i++) {
        const char* param = CommandLine()->GetParm(i);
        if (strcmp(param, "+playdemo") == 0 && i + 1 < paramCount) {
            demoPath = string(CommandLine()->GetParm(i + 1));
            std::replace(demoPath.begin(), demoPath.end(), '\\', '/');
            LoadSequencesFile(demoPath);
            break;
        }
    }

    wsConnectionThread = new thread(ConnectToWebsocketServerLoop);

    return true;
}

void CServerPlugin::Unload()
{
    isQuitting = true;

    ConVar_Unregister();
    DisconnectTier1Libraries();

    if (client != NULL)
    {
        FreeLib(client);
    }

    if (ws != NULL) {
        ws->close();
    }

    if (wsConnectionThread != NULL) {
        wsConnectionThread->join();
        wsConnectionThread = NULL;
    }
}

const char *CServerPlugin::GetPluginDescription()
{
    return "CS Demo Manager plugin";
}

CON_COMMAND(csdm_info, "Show info"){
    if (!demoPath.empty()) {
        Log("Demo path: %s", demoPath.c_str());
    }
    Log("Tick: %d", currentTick);
    Log("Is playing demo: %d", isPlayingDemo);
    Log("Sequences count: %d", sequences.size());
    Log("UI state: %d", gameUi->m_CSGOGameUIState);

    if (ws != NULL) {
        Log("WebSocket connected");
    }
    else {
        Log("WebSocket not connected");
    }
}
