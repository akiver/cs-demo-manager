#include "icvar.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_unlock_player, "Unlocks the camera locked on a player with csdm_lock_player") {
    SetPlaybackLockedPlayer(0);
}
