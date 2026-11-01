#pragma once

#include <cstdint>

#include "entity_system.h"
#include "player_slots.h"
#include "shareddefs.h"

constexpr int playerNameSize = 128;

struct SpectatedPlayer {
    uint64_t steamId;
    int controllerEntityIndex;  // Its player slot + 1.
    char name[playerNameSize];
};

struct PlayerController {
    int entityIndex;  // Its player slot + 1.
    uint64_t steamId;
    char name[playerNameSize];
    SharedTeams_t team;
    bool isLocal;
    bool isHltv;
    bool isAlive;
};

struct PawnPosition {
    float x;
    float y;
    float z;
};

bool GetSpectatedPlayer(SpectatedPlayer* spectated);
// Resolves the player the local player spectates, every few frames.
void RefreshSpectatedPlayer();
// Forgets the spectated player so the next frame resolves it again.
void ResetSpectatedPlayer();

// Reads the world position of the pawn driven by the controller at this entity index. A `steamId` of 0 matches any
// controller.
bool GetPlayerPawnPosition(int controllerEntityIndex, uint64_t steamId, PawnPosition* position);

int ListPlayerControllers(PlayerController* controllers, int maxCount);

CEntityIdentity* FindPlayerController(int entityIndex, uint64_t steamId);

void LogPlayerControllersState();
