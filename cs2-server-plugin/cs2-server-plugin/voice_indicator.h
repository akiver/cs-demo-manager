#pragma once

#include "ui/playback_controls.h"

void SetVoiceIndicatorVisible(bool visible);
bool IsVoiceIndicatorVisible();
bool IsVoiceIndicatorDrawn();
void SetVoiceIndicatorState(const VoiceIndicatorPlayer* players, int playerCount);

// Moves the panel's left middle point to these fractions of the display size, clamped to [0, 1], so it keeps its
// place when the resolution changes.
void SetVoiceIndicatorPosition(float fractionX, float fractionY);
void GetVoiceIndicatorPosition(float* fractionX, float* fractionY);

#ifdef _WIN32
void VoiceIndicatorDrawFrame();
#else
// Resolves the Vulkan layer export the indicator pushes its state to and replays the current state. Returns false when
// the layer doesn't export it.
bool VoiceIndicatorConnectLayer(void* layerLib);
// Disconnecting hides the indicator and forgets the layer.
void VoiceIndicatorDisconnectLayer();
#endif
