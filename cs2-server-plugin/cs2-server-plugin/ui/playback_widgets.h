#pragma once

#include <cstdint>

#include "imgui.h"
#include "playback_panel.h"

// The building blocks the parts of the playback panel share: the actions they report, the buttons, the tooltips, the
// menus and the colors of the timelines.

constexpr ImU32 roundBandColor = IM_COL32(255, 255, 255, 14);
constexpr ImU32 roundBandAlternateColor = IM_COL32(255, 255, 255, 38);
constexpr ImU32 roundMarkColor = IM_COL32(255, 255, 255, 60);
constexpr ImU32 hoverLineColor = IM_COL32(255, 255, 255, 160);
constexpr ImU32 bombPlantColor = IM_COL32(240, 80, 80, 255);
constexpr ImU32 bombDefuseColor = IM_COL32(80, 200, 120, 255);
// The freeze time and the time between rounds on the round timeline, when the clock doesn't run.
constexpr ImU32 roundStoppedClockBandColor = IM_COL32(0, 0, 0, 70);
constexpr ImU32 bombWindowBandColor = IM_COL32(240, 80, 80, 55);
constexpr int stoppedBombClockAlpha = 160;
constexpr ImU32 loopBandColor = IM_COL32(76, 175, 80, 60);
constexpr ImU32 loopMarkColor = IM_COL32(140, 220, 140, 230);
constexpr ImU32 sequenceBandColor = IM_COL32(200, 120, 255, 50);
constexpr ImU32 sequenceMarkColor = IM_COL32(220, 160, 255, 230);
constexpr int roundWinnerStripAlpha = 200;
// The kills of the other players, faded next to the spectated player's.
constexpr int otherKillAlpha = 70;

void AddAction(PlaybackPanelActions& actions, const PlaybackAction& action);
PlaybackAction MakeAction(PlaybackActionType type);
void AddSeekAction(PlaybackPanelActions& actions, int tick);
void AddLoopMarkAction(PlaybackPanelActions& actions, bool isEnd, int tick);
void AddSequenceMarkAction(PlaybackPanelActions& actions, bool isEnd, int tick);
void AddKillSeekAction(PlaybackPanelActions& actions, const TimelineKill& kill);
void AddSequenceSeekAction(PlaybackPanelActions& actions, const TimelineSequence& sequence);
void AddVoiceMaskAction(PlaybackPanelActions& actions, uint32_t maskLow, uint32_t maskHigh);

// A button lit while `isOn`.
bool ToggleButton(const char* label, bool isOn, ImVec2 size = ImVec2(0.f, 0.f));
float GetButtonWidth(const char* label);
// A button dimmed and inert while `isEnabled` is false, for the arrows with nothing to go to.
bool SkipButton(const char* id, ImVec2 size, bool isEnabled);
ImU32 GetSkipIconColor(bool isEnabled);

ImU32 GetTeamColor(int team);
ImU32 WithAlpha(ImU32 color, int alpha);

constexpr int tickTimeTextSize = 32;
void FormatTickTime(char* text, size_t size, int tick);

// A tooltip, unless the user turned them off.
void SetPanelTooltip(const PlaybackPanelState& state, const char* format, ...) IM_FMTARGS(2);
// ImGui keeps its tooltips within the display, but not one placed with SetNextWindowPos. Called right after
// BeginTooltip, moves it back within the display, with its size on the last frame since it fits its content.
void KeepTooltipInDisplay();
void DrawRoundTooltip(const TimelineRound& round, int roundNumber, int tick);
// The band and marks of the playback loop on a timeline, `endX` negative while the loop has no end yet.
void DrawLoopMarks(ImDrawList* drawList, float startX, float endX, bool hasStartMark, bool hasEndMark, float top,
                   float bottom, float scale);
// The pending video sequence on a timeline: a band from its start to the current tick.
void DrawSequenceMarks(ImDrawList* drawList, float startX, float currentX, bool hasStartMark, float top, float bottom,
                       float scale);

// The menu is aligned on `anchor`, the top left corner of the button opening it, above the panel when the panel sits
// in the lower half of the display and below it otherwise. It is kept on screen: pushed back from the right edge when
// it is wider than the room left of it, and scrolling when it is taller than the room above or below the panel. Every
// call must be paired with EndPanelMenu, whether the menu is open or not.
bool BeginPanelMenu(const char* id, ImVec2 anchor, ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize,
                    float scale);
void EndPanelMenu(bool isOpen);
