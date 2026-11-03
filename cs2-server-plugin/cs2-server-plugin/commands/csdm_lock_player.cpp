#include <cstdlib>

#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"
#include "string_utils.h"

CON_COMMAND(csdm_lock_player,
            "Locks the camera on a player so they are spectated again when they respawn, usage: csdm_lock_player "
            "[<SteamID64>], the spectated player without one. Switching to another player moves the lock") {
    if (args.ArgC() < 2) {
        if (!LockPlaybackSpectatedPlayer()) {
            Log("Nobody is spectated, spectate a player or give the SteamID64 of one");
        }
        return;
    }

    if (!IsDigits(args[1])) {
        Log("Usage: csdm_lock_player [<SteamID64>]");
        return;
    }

    SetPlaybackLockedPlayer(strtoull(args[1], NULL, 10));
}
