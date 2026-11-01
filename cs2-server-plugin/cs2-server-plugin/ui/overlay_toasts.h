#pragma once

#include "imgui.h"

void QueueOverlayToast(const char* text);
bool HasOverlayToasts();
void DrawOverlayToasts(float backgroundOpacity, float userScale, bool hasAnchor, ImVec2 anchorPosition,
                       ImVec2 anchorSize);
