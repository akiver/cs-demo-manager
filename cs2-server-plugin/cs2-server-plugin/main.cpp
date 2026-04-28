#include <atomic>
#include <thread>
#include <fstream>
#include <mutex>
#include <queue>
#include <sstream>
#include <nlohmann/json.hpp>
#include <easywsclient.hpp>
#include "icvar.h"
#include "cdll_interfaces.h"
#ifdef _WIN32
#define SERVER_LIB_PATH "\\csgo\\bin\\win64\\server.dll"
#else
#include <dlfcn.h>
#include <sys/mman.h>
#define SERVER_LIB_PATH "/csgo/bin/linuxsteamrt64/libserver.so"
#define PAGESIZE 4096
#endif

// IDKW registering a cmd on Linux makes the game process exit with a non zero code (Segmentation fault)
#ifdef _WIN32
#define CON_COMMAND_ENABLED 1
#endif

using easywsclient::WebSocket;
using nlohmann::json;
using std::string;

void* GetLibAddress(void* lib, const char* name) {
#if defined _WIN32
    return GetProcAddress((HMODULE)lib, name);
#else
    return dlsym(lib, name);
#endif
}

char* GetLastErrorString() {
#ifdef _WIN32
    DWORD error = GetLastError();
    static char s[_MAX_U64TOSTR_BASE2_COUNT];
    sprintf(s, "%lu", error);

    return s;
#else
    return dlerror();
#endif
}

void* LoadLib(const char* path) {
#ifdef _WIN32
    return LoadLibrary(path);
#else
    return dlopen(path, RTLD_NOW);
#endif
}

struct Action {
    int tick;
    string cmd;
};

struct Sequence {
    std::vector<Action> actions;
};

typedef bool (*AppSystemConnectFn)(IAppSystem* appSystem, CreateInterfaceFn factory);
typedef void (*AppSystemShutdownFn)();
typedef void (*FrameStageNotifyFn)(void* thisptr, ClientFrameStage_t curStage);
typedef void (*ClientFullyConnectFn)(void* thisptr, int playerSlot);

CreateInterfaceFn factory = NULL;
AppSystemConnectFn serverConfigConnect = NULL;
ClientFullyConnectFn originalClientFullyConnect = NULL;
AppSystemShutdownFn serverConfigShutdown = NULL;
CreateInterfaceFn serverCreateInterface = NULL;
ISource2EngineToClient* engineToClient = NULL;
ISource2Client* client = NULL;
FrameStageNotifyFn originalFrameStageNotify = NULL;
ICvar* g_pCVar = NULL;
std::thread* wsConnectionThread = NULL;
WebSocket::pointer ws;
string gameInfoPath;
string gameInfoBackupPath;
const char* demoPath = NULL;
bool isPlayingDemo = false;
std::atomic<int> currentTick{-1};
std::atomic<bool> isQuitting{false};
bool shouldDeleteLogFile = true;
std::mutex sequencesMutex;
std::queue<Sequence> sequences;
std::mutex pendingCommandsMutex;
std::queue<std::string> pendingCommands;
std::atomic<bool> captureInProgress{false};
std::chrono::steady_clock::time_point captureStartTime;
std::chrono::steady_clock::time_point startTime = std::chrono::steady_clock::now();

void LogToFile(const char* pMsg) {
    FILE* pFile = fopen("csdm.log", "a");
    if (pFile == NULL)
    {
        return;
    }

    fprintf(pFile, "%s\n", pMsg);
    fclose(pFile);
}

void DeleteLogFile()
{
    remove("csdm.log");
}

void Log(const char* msg, ...)
{
    va_list args;
    va_start(args, msg);
    char buf[1024] = {};
    vsnprintf(buf, sizeof(buf), msg, args);
    ConColorMsg(Color(227, 0, 255, 255), "CSDM: %s\n", buf);
    va_end(args);
    LogToFile(buf);
}

void PluginError(const char* msg, ...)
{
    va_list args;
    va_start(args, msg);
    char buf[1024] = {};
    vsnprintf(buf, sizeof(buf), msg, args);
    va_end(args);

    // Since the "Armory" update, calling Plat_FatalErrorFunc crashes the game on Windows.
#ifdef _WIN32
    Plat_MessageBox("Error", buf);
    Plat_ExitProcess(1);
#else
    Plat_FatalErrorFunc("%s", buf);
#endif
}

inline bool FileExists(const std::string& name) {
    std::ifstream f(name.c_str());

    return f.good();
}

static void UnhideCommandsAndCvars()
{
    uint64 flagsToRemove = (FCVAR_HIDDEN | FCVAR_DEVELOPMENTONLY);

    ConCommandData* data = g_pCVar->GetConCommandData(ConCommandRef());
    for (ConCommandRef concmd = ConCommandRef((uint16)0); concmd.GetRawData() != data; concmd = ConCommandRef(concmd.GetAccessIndex() + 1))
    {
        if (concmd.GetFlags() & flagsToRemove)
        {
            concmd.RemoveFlags(flagsToRemove);
        }
    }

    for (ConVarRefAbstract ref(ConVarRef((uint16)0)); ref.IsValidRef(); ref = ConVarRefAbstract(ConVarRef(ref.GetAccessIndex() + 1)))
    {
        if (ref.GetFlags() & flagsToRemove)
        {
            ref.RemoveFlags(flagsToRemove);
        }
    }
}

void PatchVTableEntry(void** vtable, int index, void* newFunc) {
    size_t protectSize = sizeof(void*) * (index + 1);
#ifdef _WIN32
    DWORD oldProtect = 0;
    if (!VirtualProtect(vtable, protectSize, PAGE_EXECUTE_READWRITE, &oldProtect))
    {
        PluginError("VirtualProtect PAGE_EXECUTE_READWRITE failed: %d", GetLastError());
    }
    vtable[index] = newFunc;
    DWORD ignore = 0;
    if (!VirtualProtect(vtable, protectSize, oldProtect, &ignore))
    {
        PluginError("VirtualProtect restore failed: %d", GetLastError());
    }
#else
    void* pageStart = (void*)((uintptr_t)vtable & ~(PAGESIZE - 1));
    if (mprotect(pageStart, PAGESIZE, PROT_READ | PROT_WRITE | PROT_EXEC) != 0)
    {
        PluginError("mprotect failed: %s", strerror(errno));
    }
    vtable[index] = newFunc;
    if (mprotect(pageStart, PAGESIZE, PROT_READ | PROT_EXEC) != 0)
    {
        PluginError("mprotect restore failed: %s", strerror(errno));
    }
#endif
}

void QueueEngineCommand(const std::string& cmd) {
    std::lock_guard<std::mutex> lock(pendingCommandsMutex);
    pendingCommands.push(cmd);
}

ISource2EngineToClient* GetEngine()
{
    if (engineToClient != NULL) {
        return engineToClient;
    }

    if (factory == NULL) {
        return NULL;
    }

    engineToClient = (ISource2EngineToClient*)factory("Source2EngineToClient001", NULL);

    return engineToClient;
}

void SendMsg(json msg) {
    if (ws != NULL) {
        ws->send(msg.dump());
    }
    else {
        Log("Cannot send message, WebSocket not connected");
    }
}

void SendStatusOk() {
    json msg;
    msg["name"] = "status";
    msg["payload"] = "ok";
    SendMsg(msg);
}

void RestoreGameinfoFile() {
    std::ifstream filebackupFile(gameInfoBackupPath);
    if (!filebackupFile.good()) {
        Log("gameinfo.gi backup file doesn't exist");
        filebackupFile.close();
        return;
    }

    std::ofstream destination(gameInfoPath);
    destination << filebackupFile.rdbuf();

    filebackupFile.close();
    destination.close();

    int result = remove(gameInfoBackupPath.c_str());
    if (result == 0) {
        Log("Backup file deleted successfully");
    }
    else
    {
        Log("Error deleting backup file");
    }
}

void LoadSequencesFile(string demoPath) {
    std::lock_guard<std::mutex> lock(sequencesMutex);
    sequences = {};

    string demoJsonPath = demoPath + ".json";
    if (FileExists(demoJsonPath)) {
        Log("Loading JSON file %s", demoJsonPath.c_str());
        std::ifstream jsonFile(demoJsonPath);
        json jsonSequences = json::parse(jsonFile);

        std::istringstream stream(jsonSequences.dump(2));
        string line;
        while (std::getline(stream, line)) {
            Log("%s", line.c_str());
        }

        if (jsonSequences.size() == 0) {
            Log("No sequences found in JSON file");
            return;
        }

        Log("Loading %d sequences", jsonSequences.size());
        for (auto jsonSequence : jsonSequences) {
            Sequence sequence;
            for (auto jsonAction : jsonSequence["actions"]) {
                Action action;
                action.tick = jsonAction["tick"];
                action.cmd = jsonAction["cmd"];
                sequence.actions.push_back(action);
            }
            sequences.push(sequence);
            Log("Sequence with %d actions loaded", sequence.actions.size());
        }

        Log("%d sequences loaded", sequences.size());
    }
    else {
        Log("JSON sequences file not found at %s", demoJsonPath.c_str());
    }
}

void NewFrameStageNotify(void* thisptr, ClientFrameStage_t stage)
{    
    if (stage != ClientFrameStage_t::FRAME_START) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    if (isQuitting) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    auto engine = GetEngine();
    if (engine == NULL) {
        Log("Engine interface not found");
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    {
        std::lock_guard<std::mutex> lock(pendingCommandsMutex);
        while (!pendingCommands.empty()) {
            std::string cmd = pendingCommands.front();
            pendingCommands.pop();
            Log("Executing queued command: %s", cmd.c_str());
            engine->ExecuteClientCmd(0, cmd.c_str(), true);
            Log("Executed queued command: %s", cmd.c_str());
        }
    }

    // Workaround to start demo playback when Steam is in offline mode, the +playdemo launch option doesn't work in this case.
    if (demoPath != NULL) {
        auto now = std::chrono::steady_clock::now();
        auto secondsSinceStart = std::chrono::duration_cast<std::chrono::seconds>(now - startTime).count();
        if (!engine->IsPlayingDemo() && secondsSinceStart >= 8) {
            string cmd = "playdemo \"" + string(demoPath) + "\"";
            demoPath = NULL;
            Log("Force playing demo: %s", cmd.c_str());
            engine->ExecuteClientCmd(0, cmd.c_str(), true);
            Log("Forced playing demo: %s", cmd.c_str());
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
    {
        if (newIsPlayingDemo && !isPlayingDemo) {
            std::lock_guard<std::mutex> lock(sequencesMutex);
            Log("[%d] Demo playback started, sequences %d", newTick, sequences.size());
        }
        else if (!newIsPlayingDemo && isPlayingDemo) {
            std::lock_guard<std::mutex> lock(sequencesMutex);
            Log("[%d] Demo playback stopped, sequences %d", newTick, sequences.size());
        }
    }

    isPlayingDemo = newIsPlayingDemo;
    if (!isPlayingDemo) {
        originalFrameStageNotify(thisptr, stage);
        return;
    }

    {
        std::lock_guard<std::mutex> lock(sequencesMutex);
        if (newTick != currentTick && !sequences.empty()) {
            // Log("Tick: %d -> %d", currentTick.load(), newTick);

            Sequence& currentSequence = sequences.front();
            for (auto& action : currentSequence.actions) {
                // Tick: 4 -> 5
                // Tick: 5 -> 6
                // Tick: 6 -> 8
                // Tick: 8 -> 9
                // Some ticks may be skipped, we execute actions for all ticks between the current tick and the new tick.
                if (action.tick > newTick || action.tick <= currentTick) {
                    continue;
                }

                if (action.cmd == "pause_playback") {
                    Log("[%d] Pausing demo playback", newTick);
                    engine->ExecuteClientCmd(0, "demo_pause", true);
                    std::this_thread::sleep_for(std::chrono::milliseconds(2000));
                    Log("[%d] Resuming demo playback", newTick);
                    engine->ExecuteClientCmd(0, "demo_resume", true);
                }
                else if (action.cmd == "go_to_next_sequence") {
                    Log("[%d] Going to next sequence, remaining sequences: %d", newTick, sequences.size() - 1);
                    sequences.pop();
                    engine->ExecuteClientCmd(0, "demo_gototick 0", true);
                    currentTick = -1;
                    break;
                }
                else {
                    Log("[%d] Executing: %s", newTick, action.cmd.c_str());
                    engine->ExecuteClientCmd(0, action.cmd.c_str(), true);
                    Log("[%d] Executed: %s", newTick, action.cmd.c_str());
                }
            }
        }
    }

    currentTick = newTick;

    originalFrameStageNotify(thisptr, stage);
}

void HandleWebSocketMessage(const std::string& message)
{
    Log("[%d] Message received: %s", currentTick.load(), message.c_str());

    json msg = json::parse(message.c_str());
    if (!msg.contains("name")) {
        return;
    }

    if (msg["name"] == "playdemo" && msg.contains("payload") && msg["payload"].is_string()) {
        SendStatusOk();

        string demoPath = msg["payload"];

        LoadSequencesFile(demoPath);

        string cmd = "playdemo \"" + demoPath + "\"";
        QueueEngineCommand(cmd);
    }
    else if (msg["name"] == "capture-player-view") {
        Log("Capturing player view");
        QueueEngineCommand("getposcopy");
        // The "screenshot" command works only on Windows when the -tools launch option is set.
        // As a workaround, we use the startmovie command to take a screenshot.
        QueueEngineCommand("hideconsole");
        QueueEngineCommand("startmovie csdmcamera jpg");
        captureStartTime = std::chrono::steady_clock::now();
        captureInProgress = true;
    }
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
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        }
    }
}

bool Connect(IAppSystem* appSystem, CreateInterfaceFn factoryFn)
{
    factory = factoryFn;
    bool result = serverConfigConnect(appSystem, factory);

    g_pCVar = (ICvar*)factory("VEngineCvar007", NULL);
    // Required to make the spec_lock_to_accountid command working since the 25/04/2024 update - it looks like the command has been hidden.
    // Also required to use the startmovie command.
    UnhideCommandsAndCvars();
#ifdef CON_COMMAND_ENABLED
    ConVar_Register();
#endif

    wsConnectionThread = new std::thread(ConnectToWebsocketServerLoop);

    RestoreGameinfoFile();

    return result;
}


void Shutdown()
{
    isQuitting = true;

    if (serverConfigShutdown != NULL) {
        serverConfigShutdown();
    }

#ifdef CON_COMMAND_ENABLED
    ConVar_Unregister();
#endif

    if (ws != NULL) {
        ws->close();
    }

    if (wsConnectionThread != NULL) {
        wsConnectionThread->join();
        wsConnectionThread = NULL;
    }
}

void AssertInsecureParameterIsPresent()
{
    bool found = false;
    // Since the "Armory" update, calling CommandLine()->HasParm("-insecure") crashes the game when the parameter is not present.
    auto parameters = CommandLine()->GetParms();
    for (int i = 0; i < CommandLine()->ParmCount(); i++)
    {
        if (strcmp(parameters[i], "-insecure") == 0)
        {
            found = true;
            break;
        }
    }

    if (!found)
    {
        PluginError("CS:DM plugin loaded without the -insecure launch option.\n\nAborting.");
    }
}

void NewClientFullyConnect(void* thisptr, int playerSlot)
{
    Log("ClientFullyConnect: playerSlot=%d", playerSlot);
    if (client != NULL) {
        originalClientFullyConnect(thisptr, playerSlot);
        return;
    }

    // Hook FrameStageNotify to call engine commands from the engine thread since it's not thread safe to call engine
    // commands from another thread.
    client = (ISource2Client*)factory("Source2Client002", NULL);
    if (client != NULL) {
        Log("Hooking FrameStageNotify");
        auto vtable = *(void***)client;
        originalFrameStageNotify = (FrameStageNotifyFn)vtable[36];
        PatchVTableEntry(vtable, 36, (void*)&NewFrameStageNotify);
        Log("Hooked FrameStageNotify");
    }
    
    // Since the 23/05/2024 CS2 update, the demo playback UI is displayed by default.
    // We have to set the demo_ui_mode convar to 0 before starting the playback prevent the UI from being displayed.
    QueueEngineCommand("demo_ui_mode 0");
    QueueEngineCommand("sv_cheats 1"); // required to unlock commands such as getposcopy

    originalClientFullyConnect(thisptr, playerSlot);
}

EXPORT void* CreateInterface(const char* pName, int* pReturnCode)
{
    if (shouldDeleteLogFile) {
        DeleteLogFile();
        shouldDeleteLogFile = false;
    }
    
    Log("CreateInterface called with %s", pName);
    if (serverCreateInterface == NULL)
    {
        AssertInsecureParameterIsPresent();

        const char* gameDirectory = Plat_GetGameDirectory();
        gameInfoPath = string(gameDirectory) + "/csgo/gameinfo.gi";
        gameInfoBackupPath = string(gameDirectory) + "/csgo/gameinfo.gi.backup";
        string libPath = string(gameDirectory) + SERVER_LIB_PATH;

        void* serverModule = LoadLib(libPath.c_str());
        if (serverModule == NULL)
        {
            PluginError("Could not load server lib %s : %s", libPath.c_str(), GetLastErrorString());
        }

        serverCreateInterface = (CreateInterfaceFn)GetLibAddress(serverModule, "CreateInterface");
        if (serverCreateInterface == NULL)
        {
            PluginError("Could not find CreateInterface : %s", GetLastErrorString());
        }
    }

    void* original = serverCreateInterface(pName, pReturnCode);
    auto vtable = *(void***)original;
    if (strcmp(pName, "Source2ServerConfig001") == 0)
    {
        serverConfigConnect = (AppSystemConnectFn)vtable[0];
        serverConfigShutdown = (AppSystemShutdownFn)vtable[4];
        PatchVTableEntry(vtable, 0, (void*)&Connect);
        PatchVTableEntry(vtable, 4, (void*)&Shutdown);
    } else if (strcmp(pName, "Source2GameClients001") == 0)
    {
        originalClientFullyConnect = (ClientFullyConnectFn)vtable[15];
        PatchVTableEntry(vtable, 15, (void*)&NewClientFullyConnect);
    }

    if (demoPath == NULL) {
        int paramCount = CommandLine()->ParmCount();
        for (int i = 0; i < paramCount; i++) {
            const char* param = CommandLine()->GetParm(i);
            if (strcmp(param, "+playdemo") == 0 && i + 1 < paramCount) {
                demoPath = CommandLine()->GetParm(i + 1);
                LoadSequencesFile(string(demoPath));
                break;
            }
        }
    }

    return original;
}

#ifdef CON_COMMAND_ENABLED
CON_COMMAND(csdm_info, "Prints CS:DM plugin info")
{
    Log("Tick: %d", currentTick.load());
    Log("Is playing demo: %d", isPlayingDemo);

    if (ws != NULL) {
        Log("WebSocket connected");
    }
    else {
        Log("WebSocket not connected");
    }

    {
        std::lock_guard<std::mutex> lock(sequencesMutex);
        Log("Sequence count: %d", sequences.size());
    }

    auto engine = GetEngine();
    if (engine == NULL) {
        Log("Engine interface not found");
        return;
    }

    Log("Is connected %d", engine->IsConnected());
    Log("Is playing demo %d", engine->IsPlayingDemo());
    Log("Is recording demo %d", engine->IsRecordingDemo());
    Log("Map %s", engine->GetLevelNameShort());
    int width, height;
    engine->GetScreenSize(width, height);
    Log("Screen size: %dx%d", width, height);

    auto demo = engine->GetDemoPlayer();
    if (demo == NULL) {
        Log("Demo player interface not found");
        return;
    }

    Log("Demo tick: %d", demo->GetDemoTick());
}
#endif