#pragma once

#include <cstdint>

#include "imgui.h"

struct ButtonsPanelLayout {
    ImVec2 position;
    ImVec2 size;
};

struct ButtonsPanelState {
    uint64_t buttons;  // InputBitMask_t value.
    float speed;       // Spectated player's speed in units per second.
    // Position of the panel's right middle point as fractions of the display size.
    float fractionX;
    float fractionY;
    bool isHighlighted;
    float backgroundOpacity;
    // Factor applied on top of the resolution-based scale, see overlayDefaultScale.
    float scale;
};

ButtonsPanelLayout DrawButtonsPanel(const ButtonsPanelState& state, ImVec2 displaySize);
