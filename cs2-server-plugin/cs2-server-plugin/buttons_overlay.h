#pragma once

#include <cstdint>

// Draws the buttons the spectated player is pressing over the game.

void SetButtonsOverlayVisible(bool visible);
bool IsButtonsOverlayVisible();

// Takes an InputBitMask_t value.
void SetButtonsOverlayPressedButtons(uint64_t buttons);

// Speed of the spectated player, in units per second.
void SetButtonsOverlaySpeed(float speed);

// Moves the panel's right middle point to these fractions of the display size, clamped to [0, 1], so it keeps its
// place when the resolution changes.
void SetButtonsOverlayPosition(float fractionX, float fractionY);
void GetButtonsOverlayPosition(float* fractionX, float* fractionY);

bool ButtonsOverlayHandleMouseDown(float x, float y);
bool ButtonsOverlayHandleMouseMove(float x, float y, bool isLeftButtonHeld);
bool ButtonsOverlayHandleMouseUp(float x, float y);

void ButtonsOverlayCancelDrag();

#ifdef _WIN32
void ButtonsOverlayDrawFrame(float width, float height);

bool ButtonsOverlayIsMouseBusy();
#else
// Looks up the panel's exports in the Vulkan layer and replays the current state into it. Returns false when an
// export is missing.
bool ButtonsOverlayConnectLayer(void* layerLib);
// Disconnecting hides the panel and forgets the layer.
void ButtonsOverlayDisconnectLayer();

void ButtonsOverlayUpdateHighlight(bool isMouseUsable, float x, float y);

bool ButtonsOverlayIsMouseBusy(float x, float y);
#endif
