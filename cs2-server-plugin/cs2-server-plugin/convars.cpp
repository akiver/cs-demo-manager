#include "convars.h"

#include <atomic>
#include <cstring>

#include "log.h"
#include "plugin.h"

static ConVarRefAbstract ResolveConVar(CachedConVar& convar) {
    if (g_pCVar != NULL && !convar.ref.IsValidRef()) {
        convar.ref = g_pCVar->FindConVar(convar.name);
    }

    return ConVarRefAbstract(g_pCVar != NULL ? convar.ref : ConVarRef());
}

static bool IsConVarAvailable(const ConVarRefAbstract& ref) { return ref.IsValidRef() && ref.IsConVarDataAvailable(); }

bool ReadConVarBool(CachedConVar& convar, bool* value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    *value = ref.GetBool();

    return true;
}

bool ReadConVarFloat(CachedConVar& convar, float* value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    *value = ref.GetFloat();

    return true;
}

bool ReadConVarInt64(CachedConVar& convar, int64_t* value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    *value = ref.GetAs<int64>();

    return true;
}

bool ReadConVarVector2D(CachedConVar& convar, float* x, float* y) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    Vector2D value = ref.GetAs<Vector2D>();
    *x = value.x;
    *y = value.y;

    return true;
}

bool WriteConVarBool(CachedConVar& convar, bool value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    ref.SetBool(value);

    return true;
}

bool WriteConVarFloat(CachedConVar& convar, float value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    ref.SetFloat(value);

    return true;
}

bool WriteConVarInt(CachedConVar& convar, int32_t value) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    ref.SetAs<int32>(value);

    return true;
}

bool WriteConVarVector2D(CachedConVar& convar, float x, float y) {
    ConVarRefAbstract ref = ResolveConVar(convar);
    if (!IsConVarAvailable(ref)) {
        return false;
    }
    ref.SetAs<Vector2D>(Vector2D(x, y));

    return true;
}

static CachedConVar roundTimeConVar = {"mp_roundtime"};
static CachedConVar roundTimeDefuseConVar = {"mp_roundtime_defuse"};
static CachedConVar roundTimeHostageConVar = {"mp_roundtime_hostage"};
static CachedConVar bombTimerConVar = {"mp_c4timer"};
static std::atomic<int> roundDurationSeconds{0};
static std::atomic<int> bombTimerSeconds{0};

// Picks the round time the game uses on the map, like CCSGameRules does: mp_roundtime_defuse on a bomb map and
// mp_roundtime_hostage on a hostage map, both in minutes, falling back on mp_roundtime when they are 0. The map type is
// read from the name prefix, de_ or cs_.
static int ReadRoundDurationSeconds() {
    float minutes = 0.f;
    auto engine = GetEngine();
    const char* mapName = engine != NULL ? engine->GetLevelNameShort() : NULL;
    bool hasMapRoundTime = false;
    if (mapName != NULL && strncmp(mapName, "de_", 3) == 0) {
        hasMapRoundTime = ReadConVarFloat(roundTimeDefuseConVar, &minutes) && minutes > 0.f;
    } else if (mapName != NULL && strncmp(mapName, "cs_", 3) == 0) {
        hasMapRoundTime = ReadConVarFloat(roundTimeHostageConVar, &minutes) && minutes > 0.f;
    }
    if (!hasMapRoundTime && (!ReadConVarFloat(roundTimeConVar, &minutes) || minutes <= 0.f)) {
        return 0;
    }

    return (int)(minutes * 60.f + 0.5f);
}

static int ReadBombTimerSeconds() {
    float seconds = 0.f;
    if (!ReadConVarFloat(bombTimerConVar, &seconds) || seconds <= 0.f) {
        return 0;
    }

    return (int)(seconds + 0.5f);
}

void ReadRoundClockConVars() {
    int newRoundDurationSeconds = ReadRoundDurationSeconds();
    int newBombTimerSeconds = ReadBombTimerSeconds();
    if (newRoundDurationSeconds != roundDurationSeconds || newBombTimerSeconds != bombTimerSeconds) {
        Log("Round clock convars: round time %d s, bomb timer %d s (0 when unavailable)", newRoundDurationSeconds,
            newBombTimerSeconds);
    }
    roundDurationSeconds = newRoundDurationSeconds;
    bombTimerSeconds = newBombTimerSeconds;
}

int GetConVarRoundDurationSeconds() { return roundDurationSeconds; }

int GetConVarBombTimerSeconds() { return bombTimerSeconds; }

void LogConVarFloat(const char* name, const char* unit) {
    CachedConVar convar = {name};
    float value;
    if (ReadConVarFloat(convar, &value)) {
        Log("%s: %g %s", name, value, unit);
    } else {
        Log("%s: unavailable", name);
    }
}
