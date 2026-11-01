#pragma once

#include "imgui.h"
#include "playback_panel.h"

void DrawSettingsMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                      ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale);

float GetShownBackgroundOpacity(const PlaybackPanelState& state);
