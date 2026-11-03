#include <atomic>

#include "clock.h"
#include "log.h"
#include "playback_cameras.h"
#include "playback_overlay.h"
#include "playback_overlay_state.h"
#include "player_controllers.h"

// How long the camera is left to settle after a seek: the game may move it to another player meanwhile, which must not
// be taken for the user switching players.
constexpr long long seekSettleMilliseconds = 2000;
// Between two spec_player sent to get back to the locked player, the spectated player is only refreshed every few
// frames.
constexpr long long respectateIntervalMilliseconds = 500;
// Gives up after that many spec_player in a row, until the camera reaches the locked player, they die or another
// player is locked, so a spec_player the game ignores isn't sent forever.
constexpr int maxRespectateAttempts = 5;

std::atomic<uint64_t> lockedSteamId{0};
std::atomic<int> lockedSlot{-1};
// The slot of the player last picked in the panel, -1 for none. Picked from the render thread, handled on the game
// thread.
static std::atomic<int> pickedSlot{-1};

// Only touched on the game thread.
static int lastTick = -1;
static long long lastSeekMilliseconds = 0;
static uint64_t lastSpectatedSteamId = 0;
static long long lastRespectateMilliseconds = 0;
static uint64_t respectatedSteamId = 0;
static int respectateAttempts = 0;

static void SetLockedSlot(int slot) {
    if (lockedSlot.exchange(slot) != slot) {
        PushPanelState();
    }
}

void SetPlaybackLockedPlayer(uint64_t steamId) {
    if (lockedSteamId.exchange(steamId) == steamId) {
        return;
    }

    if (steamId == 0) {
        Log("Camera unlocked");
    } else {
        Log("Camera locked on SteamID %llu", (unsigned long long)steamId);
    }
    PushPanelState();
}

bool LockPlaybackSpectatedPlayer() {
    uint64_t steamId = spectatedSteamId;
    if (steamId == 0 || IsOnPlaybackCamera()) {
        return false;
    }

    SetPlaybackLockedPlayer(steamId);

    return true;
}

void NotePlaybackPlayerPicked(int slot) {
    if (lockedSteamId != 0) {
        pickedSlot = slot;
    }
}

void UpdatePlaybackPlayerLock(int tick) {
    long long now = NowMilliseconds();
    // The playback start, a seek, or a frame step back while paused.
    if (lastTick < 0 || tick < lastTick || tick - lastTick > playbackTickrate * 2 || IsPlaybackSeekPending()) {
        lastSeekMilliseconds = now;
    }
    lastTick = tick;
    bool isSettling = now - lastSeekMilliseconds < seekSettleMilliseconds;

    // Nobody counts as spectated on a camera, so leaving it isn't taken for a switch to another player.
    bool isOnCamera = IsOnPlaybackCamera();
    SpectatedPlayer spectated;
    uint64_t spectatedId = !isOnCamera && GetSpectatedPlayer(&spectated) ? spectated.steamId : 0;
    uint64_t previousSpectatedId = lastSpectatedSteamId;
    lastSpectatedSteamId = spectatedId;

    int picked = pickedSlot.exchange(-1);
    uint64_t locked = lockedSteamId;
    if (locked == 0) {
        SetLockedSlot(-1);
        return;
    }

    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    const PlayerController* lockedPlayer = FindControllerBySteamId(controllers, controllerCount, locked);
    SetLockedSlot(lockedPlayer != NULL ? lockedPlayer->entityIndex - 1 : -1);
    bool isLockedPlayerAlive = lockedPlayer != NULL && lockedPlayer->isAlive;

    // Picking another player moves the lock to them, unless the locked player is dead: the camera goes back to them
    // once they respawn.
    if (picked >= 0 && (lockedPlayer == NULL || isLockedPlayerAlive)) {
        const PlayerController* pickedPlayer = FindControllerBySlot(controllers, controllerCount, picked);
        if (pickedPlayer != NULL && pickedPlayer->steamId != 0 && pickedPlayer->steamId != locked) {
            Log("Camera lock moved to %s, picked in the panel", pickedPlayer->name);
            SetPlaybackLockedPlayer(pickedPlayer->steamId);
            return;
        }
    }

    if (!isLockedPlayerAlive || isOnCamera || spectatedId == locked) {
        respectateAttempts = 0;
        return;
    }

    // Away from the locked player while they are alive, with no seek that could have moved the camera: the user
    // switched players with the number keys.
    if (!isSettling && previousSpectatedId == locked && spectatedId != 0) {
        const PlayerController* spectatedPlayer = FindControllerBySteamId(controllers, controllerCount, spectatedId);
        Log("Camera lock moved to %s", spectatedPlayer != NULL ? spectatedPlayer->name : "another player");
        SetPlaybackLockedPlayer(spectatedId);
        return;
    }

    // Following nobody out of a seek, the user is roaming: left alone.
    if (spectatedId == 0 && !isSettling) {
        return;
    }

    if (respectatedSteamId != locked) {
        respectatedSteamId = locked;
        respectateAttempts = 0;
    }
    if (respectateAttempts >= maxRespectateAttempts ||
        now - lastRespectateMilliseconds < respectateIntervalMilliseconds) {
        return;
    }

    lastRespectateMilliseconds = now;
    respectateAttempts++;
    if (respectateAttempts == 1) {
        Log("[%d] Camera locked on %s, spectating them again", tick, lockedPlayer->name);
    } else if (respectateAttempts == maxRespectateAttempts) {
        Log("[%d] Camera locked on %s, still not spectated after %d attempts, giving up until they respawn", tick,
            lockedPlayer->name, maxRespectateAttempts);
    }
    SpectatePlaybackPlayer(lockedPlayer->entityIndex - 1);
}

void ResetPlaybackPlayerLock() {
    lockedSteamId = 0;
    lockedSlot = -1;
    pickedSlot = -1;
    lastTick = -1;
    lastSpectatedSteamId = 0;
    respectateAttempts = 0;
    PushPanelState();
}
