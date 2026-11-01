#pragma once

#include <cstdint>

#include "entity2/entityidentity.h"

// The client's entity system, NULL while it can't be found. It only exists while a demo is playing.
uint8_t* GetEntitySystem();

CEntityIdentity* GetEntityIdentity(uint8_t* entitySystem, int index);

void LogEntitySystemState();
