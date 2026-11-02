#pragma once

#include <climits>
#include <cstdint>
#include <cstring>

#include "player_slots.h"

constexpr float playbackSpeeds[] = {0.25f, 0.5f, 1.f, 2.f, 4.f, 8.f};
constexpr int playbackSpeedCount = sizeof(playbackSpeeds) / sizeof(playbackSpeeds[0]);

constexpr int playbackTickrate = 64;

// How far the skip buttons of the panel seek. The settings menu shows the choices, the convar takes any number of
// seconds within the range.
constexpr int playbackSkipSecondsChoices[] = {5, 10, 30};
constexpr int playbackSkipSecondsChoiceCount =
    sizeof(playbackSkipSecondsChoices) / sizeof(playbackSkipSecondsChoices[0]);
constexpr int playbackDefaultSkipSeconds = 10;
constexpr int playbackMinSkipSeconds = 1;
constexpr int playbackMaxSkipSeconds = 300;

// How far past the end of the loop the playback may be and still be sent back to its start. Further than that, the
// user seeked out of the loop on purpose.
constexpr int playbackLoopWrapMarginSeconds = 5;

// The panel is placed by its bottom center, as a fraction of the display size, so it keeps its relative place when the
// resolution changes and stays put when its own size changes. The default is centered against the bottom edge.
constexpr float playbackPanelDefaultFractionX = 0.5f;
constexpr float playbackPanelDefaultFractionY = 1.f;

// The pressed buttons panel is placed by its right middle point, the default is against the right edge, vertically
// centered.
constexpr float buttonsOverlayDefaultFractionX = 0.98f;
constexpr float buttonsOverlayDefaultFractionY = 0.5f;

// The voice indicator is placed by its left middle point, the default is against the left edge, vertically centered.
constexpr float voiceIndicatorDefaultFractionX = 0.02f;
constexpr float voiceIndicatorDefaultFractionY = 0.5f;

// Seconds without mouse activity before the playback panel hides, 0 to keep it shown, which is the default.
constexpr float playbackPanelDefaultAutoHideDelay = 0.f;
// What the auto-hide checkbox of the settings menu turns on, and the range of its slider.
constexpr float playbackPanelInitialAutoHideDelay = 3.f;
constexpr int playbackPanelMinAutoHideDelay = 1;
constexpr int playbackPanelMaxAutoHideDelay = 10;

// The opacity of the backgrounds of every overlay. The default is the alpha of overlayPanelBackgroundColor.
// It is repeated rather than read from overlay_palette.h, which includes imgui.h: on Linux the plugin draws nothing
// and isn't built with ImGui. playback_panel.cpp checks that both values agree.
constexpr float overlayDefaultBackgroundOpacity = 160.f / 255.f;

constexpr float overlayDefaultScale = 1.f;
constexpr float overlayMinScale = 0.5f;
constexpr float overlayMaxScale = 2.f;

constexpr int playbackMaxPlayers = 24;
constexpr int playbackPlayerNameSize = 64;

// Mirrors CS_TEAM_T / CS_TEAM_CT from s2sdk shareddefs.h, duplicated because this header is also compiled into the
// Vulkan layer, which doesn't depend on the SDK.
constexpr int playbackTeamT = 2;
constexpr int playbackTeamCT = 3;

struct PlaybackPlayer {
    char name[playbackPlayerNameSize];
    // The bit of the player in the voice convars, and its controller entity index minus one.
    int slot;
    int team;
    bool isAlive;
    // The number key that spectates the player, 1 to 9 then 0 for the tenth player, -1 without one.
    int numberKey;
};

// Whether the player at `slot` is heard with these tv_listen_voice_indices/tv_listen_voice_indices_h values.
inline bool IsVoiceSlotEnabled(uint32_t maskLow, uint32_t maskHigh, int slot) {
    if (slot < 0 || slot >= maxPlayerSlots) {
        return false;
    }

    return slot < 32 ? ((maskLow >> slot) & 1u) != 0 : ((maskHigh >> (slot - 32)) & 1u) != 0;
}

// The bit of the player at `slot`: in `maskLow` for slots below 32, in `maskHigh` for the others.
inline void GetVoiceSlotBit(int slot, uint32_t* maskLow, uint32_t* maskHigh) {
    *maskLow = slot < 32 ? 1u << slot : 0u;
    *maskHigh = slot < 32 ? 0u : 1u << (slot - 32);
}

// Pushed by the plugin into the Vulkan layer every frame on Linux. The voice menu and the timeline are pushed
// separately since they change far less often.
struct OverlayPlaybackState {
    bool isPlaying;  // Whether a demo is being played.
    int tick;
    int totalTicks;
    bool isPaused;
    float speed;
    bool isXrayEnabled;
    bool isButtonsOverlayVisible;
    bool isVoiceIndicatorVisible;
    bool isMatchTimelineVisible;
    bool isRoundTimelineVisible;
    bool isRoundTimelineSpectatedOnly;
    bool isFollowKillerEnabled;
    float autoHideDelay;
    int skipSeconds;
    uint64_t spectatedSteamId;
    int spectatedSlot;
    // The ticks the playback loops between, -1 while not set. The end is never set without the start.
    int loopStartTick;
    int loopEndTick;
    // The tick a video sequence was started at with the sequence button, -1 while none is pending.
    int sequenceStartTick;
    // Whether the app is connected to the plugin over the WebSocket.
    bool isAppConnected;
    // The round time and bomb timer of the server that recorded the demo, from its convars. 0 while unavailable.
    int roundDurationSeconds;
    int bombTimerSeconds;
};

// The keys the panels' text fields react to, passed by the plugin to the Vulkan layer on Linux.
enum OverlayKey {
    OVERLAY_KEY_ENTER,
    OVERLAY_KEY_ESCAPE,
    OVERLAY_KEY_BACKSPACE,
    OVERLAY_KEY_DELETE,
    OVERLAY_KEY_LEFT,
    OVERLAY_KEY_RIGHT,
    OVERLAY_KEY_HOME,
    OVERLAY_KEY_END,
};

enum OverlayMouseButton {
    OVERLAY_MOUSE_BUTTON_LEFT,
    OVERLAY_MOUSE_BUTTON_RIGHT,
};

constexpr int voiceIndicatorMaxPlayers = 16;

struct VoiceIndicatorPlayer {
    char name[playbackPlayerNameSize];
    int team;
    bool isMuted;
};

// A camera the user saved for the demo's map in the app. Cameras past the maximum are dropped and longer names are
// truncated.
constexpr int playbackMaxCameras = 64;
constexpr int playbackCameraNameSize = 64;

struct PlaybackCamera {
    char name[playbackCameraNameSize];
    float x;
    float y;
    float z;
    float pitch;
    float yaw;
    // Packed as ImU32 (IM_COL32), transparent when the app's color can't be parsed.
    uint32_t color;
};

// Reads the digits between `start` and `end`. False when there are none, too many to fit an int once converted to
// ticks, or when something else is in between.
inline bool ParseDigits(const char* start, const char* end, long long* value) {
    if (start == end || end - start > 9) {
        return false;
    }

    *value = 0;
    for (const char* c = start; c < end; c++) {
        if (*c < '0' || *c > '9') {
            return false;
        }
        *value = *value * 10 + (*c - '0');
    }

    return true;
}

// The tick to seek to for a time as minutes:seconds like the panel shows it (12:34, 75:02), or a tick (45000). -1 when
// it is neither.
inline int ParseGoToTick(const char* text) {
    const char* end = text + strlen(text);
    const char* colon = strchr(text, ':');
    long long tick;
    if (colon == NULL) {
        if (!ParseDigits(text, end, &tick)) {
            return -1;
        }
    } else {
        long long minutes;
        long long seconds;
        if (!ParseDigits(text, colon, &minutes) || !ParseDigits(colon + 1, end, &seconds) || end - colon > 3 ||
            seconds >= 60) {
            return -1;
        }
        tick = (minutes * 60 + seconds) * playbackTickrate;
    }

    return tick > INT_MAX ? -1 : (int)tick;
}

// What the user did on the panel, reported by the drawing code to the plugin, which carries it out.
enum PlaybackActionType {
    PLAYBACK_ACTION_TOGGLE_PAUSE,
    PLAYBACK_ACTION_SEEK,
    // Seeks a few seconds ahead of a kill, and spectates its killer once there when following the killer is on.
    PLAYBACK_ACTION_GOTO_KILL,
    // Seeks to the start of a highlight or lowlight, and spectates its player once there.
    PLAYBACK_ACTION_GOTO_SEQUENCE,
    PLAYBACK_ACTION_SET_SPEED,
    PLAYBACK_ACTION_TOGGLE_XRAY,
    PLAYBACK_ACTION_TOGGLE_BUTTONS_OVERLAY,
    PLAYBACK_ACTION_TOGGLE_VOICE_INDICATOR,
    PLAYBACK_ACTION_TOGGLE_MATCH_TIMELINE,
    PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE,
    PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE_SPECTATED_ONLY,
    PLAYBACK_ACTION_TOGGLE_FOLLOW_KILLER,
    PLAYBACK_ACTION_SET_LOOP_START,
    PLAYBACK_ACTION_SET_LOOP_END,
    PLAYBACK_ACTION_CLEAR_LOOP,
    PLAYBACK_ACTION_SET_SEQUENCE_START,
    PLAYBACK_ACTION_END_SEQUENCE,
    PLAYBACK_ACTION_CLEAR_SEQUENCE_START,
    PLAYBACK_ACTION_END_PLAYBACK,
    PLAYBACK_ACTION_PLAY_LAST_DEMO,
    PLAYBACK_ACTION_SET_VOICE_MASK,
    PLAYBACK_ACTION_GOTO_CAMERA,
    PLAYBACK_ACTION_SPECTATE_PLAYERS,
    PLAYBACK_ACTION_SPECTATE_PLAYER,
    PLAYBACK_ACTION_SET_BACKGROUND_OPACITY,
    PLAYBACK_ACTION_SET_TOOLTIPS_ENABLED,
    PLAYBACK_ACTION_SET_AUTO_HIDE_DELAY,
    PLAYBACK_ACTION_SET_SCALE,
    PLAYBACK_ACTION_SET_SKIP_SECONDS,
};

// On Linux the action goes from the Vulkan layer to the plugin, two libraries built separately, so it keeps a plain C
// layout that doesn't depend on the standard library.
struct PlaybackAction {
    PlaybackActionType type;
    union {
        // PLAYBACK_ACTION_SEEK, PLAYBACK_ACTION_SET_LOOP_START, PLAYBACK_ACTION_SET_LOOP_END,
        // PLAYBACK_ACTION_SET_SEQUENCE_START, PLAYBACK_ACTION_END_SEQUENCE
        int tick;
        float speed;  // PLAYBACK_ACTION_SET_SPEED
        struct {
            int tick;
            uint64_t killerSteamId;  // 0 for a bot, nobody to follow then.
        } kill;                      // PLAYBACK_ACTION_GOTO_KILL
        struct {
            int tick;
            uint64_t steamId;
        } sequence;  // PLAYBACK_ACTION_GOTO_SEQUENCE
        struct {
            uint32_t low;
            uint32_t high;
        } voiceMask;              // PLAYBACK_ACTION_SET_VOICE_MASK
        int cameraIndex;          // PLAYBACK_ACTION_GOTO_CAMERA
        int slot;                 // PLAYBACK_ACTION_SPECTATE_PLAYER
        float backgroundOpacity;  // PLAYBACK_ACTION_SET_BACKGROUND_OPACITY
        int areTooltipsEnabled;   // PLAYBACK_ACTION_SET_TOOLTIPS_ENABLED
        float autoHideDelay;      // PLAYBACK_ACTION_SET_AUTO_HIDE_DELAY
        float scale;              // PLAYBACK_ACTION_SET_SCALE
        int skipSeconds;          // PLAYBACK_ACTION_SET_SKIP_SECONDS
    };
};

// A frame produces a click or two at most. The fixed array spares the drawing code an allocation.
constexpr int playbackMaxActionsPerFrame = 8;

struct PlaybackPanelActions {
    int count;
    PlaybackAction actions[playbackMaxActionsPerFrame];
};

typedef void (*PlaybackActionCallback)(const PlaybackAction* action);
