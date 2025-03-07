#include <thread>
#include <fstream>
#include <queue>
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

CreateInterfaceFn factory = NULL;
AppSystemConnectFn serverConfigConnect = NULL;
AppSystemShutdownFn serverConfigShutdown = NULL;
CreateInterfaceFn serverCreateInterface = NULL;
ISource2EngineToClient* engineToClient = NULL;
ICvar* g_pCVar = NULL;
std::thread* wsConnectionThread = NULL;
std::thread* demoPlaybackThread = NULL;
WebSocket::pointer ws;
string gameInfoPath;
string gameInfoBackupPath;
const char* demoPath = NULL;
bool isPlayingDemo = false;
int currentTick = -1;
bool isQuitting = false;
bool initialized = false;
std::queue<Sequence> sequences;

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

void Log(const char *msg, ...)
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

void SendStatusOk() {
    json msg;
    msg["name"] = "status";
    msg["payload"] = "ok";
    ws->send(msg.dump());
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

void PlaybackLoop() {
    std::this_thread::sleep_for(std::chrono::milliseconds(2000));

    while (true) {
        if (isQuitting) {
            break;
        }

        auto engine = GetEngine();
        if (engine == NULL) {
            continue;
        }

        if (!initialized) {
            // Since the 23/05/2024 CS2 update, the demo playback UI is displayed by default.
			// We have to set the demo_ui_mode convar to 0 before starting the playback prevent the UI from being displayed.
            engine->ExecuteClientCmd(0, "demo_ui_mode 0", true);
            initialized = true;
        }

        bool newIsPlayingDemo = engine->IsPlayingDemo();
        if (newIsPlayingDemo && !isPlayingDemo) {
            Log("Demo playback started %d", currentTick);
            currentTick = -1;

            // Required to make the spec_lock_to_accountid command working since the 25/04/2024 update - it looks like the command has been hidden.
            // Also required to use the startmovie command.
            UnhideCommandsAndCvars();
        }
        else if (!newIsPlayingDemo && isPlayingDemo) {
            Log("Demo playback stopped %d", currentTick);
            currentTick = -1;
        }

        isPlayingDemo = newIsPlayingDemo;
        if (!isPlayingDemo) {
            continue;
        }

        auto demo = engine->GetDemoFile();
        if (demo == NULL) {
            continue;
        }

        int newTick = demo->GetDemoTick();
        if (newTick != currentTick) {
            // Log("Tick: %d", newTick);

            Sequence currentSequence = sequences.front();
            for (auto action : currentSequence.actions) {
                if (action.tick == newTick) {
                    if (action.cmd == "pause_playback") {
                        Log("Pausing demo playback");
                        engine->ExecuteClientCmd(0, "demo_pause", true);
                        std::this_thread::sleep_for(std::chrono::milliseconds(2000));
                        Log("Resuming demo playback");
                        engine->ExecuteClientCmd(0, "demo_resume", true);
                    } else if (action.cmd == "go_to_next_sequence") {
                        Log("Going to next sequence, remaining sequences: %d", sequences.size() - 1);
                        sequences.pop();
                        engine->ExecuteClientCmd(0, "demo_gototick 0", true);
                        currentTick = -1;
                    } else {
                        Log("Executing: %s", action.cmd.c_str());
                        engine->ExecuteClientCmd(0, action.cmd.c_str(), true);
                    }
                }
            }
        }

        currentTick = newTick;
    }
}

void HandleWebSocketMessage(const std::string& message)
{
    Log("Message received: %s", message.c_str());

    json msg = json::parse(message.c_str());
    if (!msg.contains("name")) {
        return;
    }

    if (msg["name"] == "playdemo" && msg.contains("payload") && msg["payload"].is_string()) {
        SendStatusOk();

        string demoPath = msg["payload"];

        LoadSequencesFile(demoPath);

        string cmd = "playdemo \"" + demoPath + "\"";
        Log("Starting demo: %s", cmd.c_str());
        auto engine = GetEngine();
        engine->ExecuteClientCmd(0, cmd.c_str(), true);
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
    #ifdef CON_COMMAND_ENABLED
        ConVar_Register();
    #endif

    wsConnectionThread = new std::thread(ConnectToWebsocketServerLoop);
    demoPlaybackThread = new std::thread(PlaybackLoop);

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

    if (demoPlaybackThread != NULL) {
        demoPlaybackThread->join();
        demoPlaybackThread = NULL;
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

EXPORT void* CreateInterface(const char* pName, int* pReturnCode)
{
    if (serverCreateInterface == NULL)
    {
        DeleteLogFile();
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
    if (strcmp(pName, "Source2ServerConfig001") == 0)
    {
        auto vtable = *(void***)original;

#if defined _WIN32
        DWORD oldProtect = 0;
        if (!VirtualProtect(vtable, sizeof(void**), PAGE_EXECUTE_READWRITE, &oldProtect))
        {
            PluginError("VirtualProtect PAGE_EXECUTE_READWRITE failed: %d", GetLastError());
        }

        serverConfigConnect = (AppSystemConnectFn)vtable[0];
        serverConfigShutdown = (AppSystemShutdownFn)vtable[1];
        vtable[0] = &Connect;
        vtable[1] = &Shutdown;

        DWORD ignore = 0;
        if (!VirtualProtect(vtable, sizeof(void**), oldProtect, &ignore))
        {
            PluginError("VirtualProtect restore failed: %d", GetLastError());
        }
#else
        void* pageStart = (void*)((uintptr_t)vtable & ~(PAGESIZE - 1));
        if (mprotect(pageStart, PAGESIZE, PROT_READ | PROT_WRITE | PROT_EXEC) != 0)
        {
            PluginError("mprotect failed: %s", strerror(errno));
        }

        serverConfigConnect = (AppSystemConnectFn)vtable[0];
        serverConfigShutdown = (AppSystemShutdownFn)vtable[4];
        vtable[0] = reinterpret_cast<void*>(&Connect);
        vtable[4] = reinterpret_cast<void*>(&Shutdown);

        if (mprotect(pageStart, PAGESIZE, PROT_READ | PROT_EXEC) != 0)
        {
            PluginError("mprotect restore failed: %s", strerror(errno));
        }
#endif
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
    Log("Tick: %d", currentTick);
    Log("Is playing demo: %d", isPlayingDemo);

    if (ws != NULL) {
        Log("WebSocket connected");
    }
    else {
        Log("WebSocket not connected");
    }

    Log("Sequence count: %d", sequences.size());
}
#endif