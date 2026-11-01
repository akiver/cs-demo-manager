#pragma once

#include "imgui.h"
#include "playback_panel.h"

void DrawGoToMenu(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                  ImVec2 anchor, ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale);
