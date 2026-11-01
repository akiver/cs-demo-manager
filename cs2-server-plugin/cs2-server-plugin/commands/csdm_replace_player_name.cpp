#include <string>

#include "icvar.h"
#include "log.h"
#include "player_names.h"

CON_COMMAND(
    csdm_replace_player_name,
    "Changes the name the game shows for a player, usage: csdm_replace_player_name <target> [name] where the target "
    "is a player slot, a SteamID64 or the start of a player name, and no name brings the demo's name back. Use "
    "csdm_players to list them") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_replace_player_name <target> [name]");
        return;
    }

    // Unquoted names with spaces come as several arguments.
    std::string name;
    for (int i = 2; i < args.ArgC(); i++) {
        if (i > 2) {
            name += " ";
        }
        name += args[i];
    }

    ReplacePlayerName(args[1], args.ArgC() > 2 ? name.c_str() : NULL);
}
