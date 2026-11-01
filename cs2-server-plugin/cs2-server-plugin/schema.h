#pragma once

// Fields of the game's classes, looked up by name in the client schema so the offsets follow game updates. The enum of
// ids and the lookup table are both generated from this list so they can't get out of order.
#define SCHEMA_FIELDS(X)                                                                        \
    X(IS_LOCAL_PLAYER_CONTROLLER, "CBasePlayerController", "m_bIsLocalPlayerController", false) \
    X(IS_HLTV, "CBasePlayerController", "m_bIsHLTV", true)                                      \
    X(CONTROLLER_PAWN, "CBasePlayerController", "m_hPawn", false)                               \
    X(CONTROLLER_PLAYER_PAWN, "CCSPlayerController", "m_hPlayerPawn", true)                     \
    X(CONTROLLER_OBSERVER_PAWN, "CCSPlayerController", "m_hObserverPawn", true)                 \
    X(CONTROLLER_STEAM_ID, "CBasePlayerController", "m_steamID", true)                          \
    X(OBSERVER_SERVICES, "CBasePlayerPawn", "m_pObserverServices", false)                       \
    X(OBSERVER_TARGET, "CPlayer_ObserverServices", "m_hObserverTarget", false)                  \
    X(OBSERVER_MODE, "CPlayer_ObserverServices", "m_iObserverMode", true)                       \
    X(CONTROLLER_NAME, "CBasePlayerController", "m_iszPlayerName", true)                        \
    X(CONTROLLER_SANITIZED_NAME, "CCSPlayerController", "m_sSanitizedPlayerName", true)         \
    X(CONTROLLER_NAME_DIRTY, "CCSPlayerController", "m_bIsPlayerNameDirty", true)               \
    X(TEAM_NUM, "CBaseEntity", "m_iTeamNum", true)                                              \
    X(PAWN_IS_ALIVE, "CCSPlayerController", "m_bPawnIsAlive", true)                             \
    X(GAME_SCENE_NODE, "CBaseEntity", "m_pGameSceneNode", true)                                 \
    X(SCENE_NODE_ABS_ORIGIN, "CGameSceneNode", "m_vecAbsOrigin", true)

enum SchemaFieldId {
#define SCHEMA_FIELD_ID(id, className, fieldName, isOptional) FIELD_##id,
    SCHEMA_FIELDS(SCHEMA_FIELD_ID)
#undef SCHEMA_FIELD_ID
        FIELD_COUNT,
};

// Looks up the offset of every field not resolved yet in the client schema. True once all the required fields have
// been found, the optional ones may still be missing.
bool ResolveSchemaFields();

// Offset of the field in its class, -1 while the field hasn't been found.
int GetSchemaOffset(SchemaFieldId field);

// Size in bytes of a fixed-size array field, 0 for anything that isn't one.
int GetSchemaSize(SchemaFieldId field);

bool IsUtlStringField(SchemaFieldId field);

const char* GetSchemaClassName(SchemaFieldId field);

const char* GetSchemaFieldName(SchemaFieldId field);

void LogSchemaFields();
