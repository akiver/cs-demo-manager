#include "buttons_overlay_target.h"
#include "cdll_interfaces.h"
#include "convars.h"
#include "icvar.h"
#include "log.h"
#include "net_messages.h"
#include "playback_overlay.h"
#include "player_controllers.h"
#include "player_names.h"
#include "plugin.h"
#include "sequences.h"
#include "user_commands.h"
#include "voice_activity.h"
#include "websocket.h"

static void LogRoundClockState() {
    LogConVarFloat("mp_roundtime", "minutes");
    LogConVarFloat("mp_roundtime_defuse", "minutes");
    LogConVarFloat("mp_roundtime_hostage", "minutes");
    LogConVarFloat("mp_c4timer", "seconds");
    Log("Round clock convars: round time %d s, bomb timer %d s (0 when unavailable)", GetConVarRoundDurationSeconds(),
        GetConVarBombTimerSeconds());
    LogPlaybackRoundClockState();
}

CON_COMMAND(csdm_info, "Prints CS:DM plugin info") {
    Log("Tick: %d", currentTick.load());
    Log("Is playing demo: %d", isPlayingDemo);

    LogNetMessagesState();
    LogUserCommandsState();
    LogButtonsOverlayTargetState();
    LogPlayerControllersState();
    LogReplacedPlayerNamesState();
    LogVoiceActivityState();
    LogRoundClockState();

    Log("WebSocket %s", IsWebSocketConnected() ? "connected" : "not connected");
    Log("Sequence count: %d", GetSequenceCount());

    auto engine = GetEngine();
    if (engine == NULL) {
        Log("Engine interface not found");
        return;
    }

    Log("Is connected %d", engine->IsConnected());
    Log("Is playing demo %d", engine->IsPlayingDemo());
    Log("Is recording demo %d", engine->IsRecordingDemo());
    Log("Map %s", engine->GetLevelNameShort());
    Log("Demo path: %s", engine->GetDemoFilePath());
    int width, height;
    engine->GetScreenSize(width, height);
    Log("Screen size: %dx%d", width, height);

    auto demo = engine->GetDemoPlayer();
    if (demo == NULL) {
        Log("Demo player interface not found");
        return;
    }

    Log("Demo tick: %d", demo->GetDemoTick());
    Log("Demo start tick: %d", demo->GetDemoStartTick());
    Log("Demo total ticks: %d", demo->GetTotalDemoTicks());
    Log("Demo time: %f/%f", demo->TicksToTime(demo->GetDemoTick()), demo->TicksToTime(demo->GetTotalDemoTicks()));
    Log("Is playback active: %d", demo->IsPlaybackActive());
    Log("Is playback paused: %d", demo->IsPlaybackPaused());
}
