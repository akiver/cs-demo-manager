#pragma once

#include "playback_controls.h"

struct VoiceIndicatorState {
    int playerCount;
    VoiceIndicatorPlayer players[voiceIndicatorMaxPlayers];
};

void DrawVoiceIndicatorPanel(const VoiceIndicatorState& state, float backgroundOpacity, float scale);

// Moves the panel's left middle point to these fractions of the display size, clamped to [0, 1], the next time it is
// drawn.
void MoveVoiceIndicatorPanelTo(float fractionX, float fractionY);
void GetVoiceIndicatorPanelPlacement(float* fractionX, float* fractionY);
