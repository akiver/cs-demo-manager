#pragma once

// Hooks the renderer so the panels are drawn on every frame. Safe to call more than once.
void InstallOverlay();

// Hides the panels and removes the hooks.
void RemoveOverlay();

// Whether at least one panel currently has something to draw.
bool IsAnyPanelVisible();

// The opacity of the backgrounds of every panel, from 0 to 1.
void SetOverlayBackgroundOpacity(float opacity);
float GetOverlayBackgroundOpacity();

// The factor applied on top of the resolution-based scale of every panel, see overlayDefaultScale.
void SetOverlayScale(float scale);
float GetOverlayScale();

// Whether the panels explain their buttons and settings with a tooltip.
void SetOverlayTooltipsEnabled(bool isEnabled);
bool AreOverlayTooltipsEnabled();

// Shows a short message next to the playback panel for a few seconds. Safe to call from any thread.
void ShowOverlayToast(const char* text);

#ifdef _WIN32
// The cursor can only point at a panel while it is visible, which is when a menu or the demo playback UI is open and
// the mouse isn't driving the camera.
bool OverlayIsCursorVisible();

// Cursor position in the client area of the game window, the same space ImGui draws in. False when the cursor is
// hidden or the game window isn't in the foreground.
bool OverlayGetCursorPositionInWindow(float* x, float* y);

// Whether the panels are drawn in the frames the game captures (startmovie).
void SetOverlayDrawnInCaptures(bool isDrawn);
#endif
