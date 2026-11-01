#pragma once

// Player slots go from 0 to 63. A slot indexes the userinfo string table, is the player's bit in the voice convars and
// is the entity index of its player controller minus one.
constexpr int maxPlayerSlots = 64;
