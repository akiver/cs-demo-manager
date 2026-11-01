#pragma once

#include <cstdint>

#include "icvar.h"

// A convar looked up by name the first time it is read or written. A convar keeps its ref for the whole run, so the
// ref is cached and the readers called every frame don't look the name up again.
struct CachedConVar {
    const char* name;
    ConVarRef ref;
};

bool ReadConVarBool(CachedConVar& convar, bool* value);
bool ReadConVarFloat(CachedConVar& convar, float* value);
bool ReadConVarInt64(CachedConVar& convar, int64_t* value);
bool ReadConVarVector2D(CachedConVar& convar, float* x, float* y);
bool WriteConVarBool(CachedConVar& convar, bool value);
bool WriteConVarFloat(CachedConVar& convar, float value);
bool WriteConVarInt(CachedConVar& convar, int32_t value);
bool WriteConVarVector2D(CachedConVar& convar, float x, float y);

// Reads the server convars the round clock runs on.
void ReadRoundClockConVars();
int GetConVarRoundDurationSeconds();
int GetConVarBombTimerSeconds();

void LogConVarFloat(const char* name, const char* unit);
