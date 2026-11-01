#pragma once

#include "imgui.h"
#include "playback_panel.h"

void DrawVoiceMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor, ImVec2 panelPosition,
                   ImVec2 panelSize, ImVec2 displaySize, float scale);
void DrawCamerasMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                     ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale);
void DrawPlayersMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                     ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale);
