#include "icvar.h"
#include "log.h"
#include "player_voices.h"

CON_COMMAND(csdm_voice_unmute,
            "Unmutes the voice of players, usage: csdm_voice_unmute <target...> where a target is all, "
            "ct, t, others, a player slot, a SteamID64 or the start of a player name. Use csdm_players to list them") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_voice_unmute <target...>");
        return;
    }

    SetPlayerVoicesMuted(args.ArgC() - 1, args.ArgV() + 1, false);
}
