#include "icvar.h"
#include "log.h"
#include "player_controllers.h"
#include "player_voices.h"
#include "ui/playback_controls.h"

static const char* GetTeamLabel(SharedTeams_t team) {
    switch (team) {
        case CS_TEAM_CT:
            return "CT";
        case CS_TEAM_T:
            return "T";
        default:
            return "Other";
    }
}

CON_COMMAND(csdm_players,
            "Prints the players of the demo: slot, team, SteamID, whether their voice is heard and name") {
    uint32_t maskLow = 0;
    uint32_t maskHigh = 0;
    bool hasMask = ReadListenVoiceMask(&maskLow, &maskHigh);
    if (!hasMask) {
        Log("Listen voice convars not found, every player is shown as muted");
    }

    PlayerController controllers[maxPlayerSlots];
    int controllerCount = ListPlayerControllers(controllers, maxPlayerSlots);
    int playerCount = 0;
    for (int i = 0; i < controllerCount; i++) {
        const PlayerController& controller = controllers[i];
        if (controller.isHltv || controller.steamId == 0) {
            continue;
        }

        if (playerCount++ == 0) {
            Log("%-5s %-6s %-18s %-6s %s", "Slot", "Team", "SteamID", "Voice", "Name");
        }

        int slot = controller.entityIndex - 1;
        Log("%-5d %-6s %-18llu %-6s %s", slot, GetTeamLabel(controller.team), (unsigned long long)controller.steamId,
            hasMask && IsVoiceSlotEnabled(maskLow, maskHigh, slot) ? "heard" : "muted", controller.name);
    }

    if (playerCount == 0) {
        Log("No players");
    }
}
