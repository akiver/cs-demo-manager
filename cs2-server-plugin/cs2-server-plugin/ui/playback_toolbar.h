#pragma once

#include "imgui.h"
#include "playback_panel.h"

// The controls of the row under the timelines, other than the plain buttons the panel draws itself.

// The width of the time and tick lines at their widest, so the row doesn't shift as the time goes by.
float GetTimeTextWidth(const PlaybackPanelState& state);
// The match time and the tick, which open the go-to menu.
void DrawTimeText(const PlaybackPanelState& state, float width, float height, float scale);

// The clock of the game's HUD next to the match time: the freeze time left, then the round time left, and the bomb
// timer once the bomb is planted. Only drawn with rounds, so the panel doesn't carry an empty column for a demo that
// wasn't analyzed.
bool HasRoundClock(const PlaybackTimeline& timeline);
float GetRoundClockWidth();
void DrawRoundClock(const PlaybackPanelState& state, const PlaybackTimeline& timeline, float width, float height);

// One button takes the loop through its states: a first click sets the start at the current time, a second sets the
// end and starts looping, a third clears the loop.
void DrawLoopButton(const PlaybackPanelState& state, ImVec2 size, PlaybackPanelActions& actions);
// A first click marks the start of a video sequence at the current time, a second marks its end and sends it to the
// video page of the app, a right click forgets the start. Inert while the app is not connected.
void DrawSequenceButton(const PlaybackPanelState& state, ImVec2 size, PlaybackPanelActions& actions);
void DrawFrameStepButton(const char* id, const PlaybackPanelState& state, bool isNext, ImVec2 size,
                         PlaybackPanelActions& actions);
void DrawPlayerCycleButton(const char* id, const PlaybackPanelState& state, bool isNext, ImVec2 size,
                           PlaybackPanelActions& actions);
// A grip of dots at the left of the controls to drag the panel around.
void DrawDragHandle(const PlaybackPanelState& state, ImVec2 size, ImVec2 panelPosition, ImVec2 panelSize,
                    ImVec2 displaySize);
// The button between the arrows: the name of the spectated player, and it opens the players menu.
void DrawSpectatedPlayerButton(const PlaybackPanelState& state, ImVec2 size);
// A track with a notch per playback speed the knob snaps to. Returns the index of the speed shown: while the knob is
// dragged the dragged one rather than the game's, which lags behind by a frame or two.
int DrawSpeedSlider(const PlaybackPanelState& state, PlaybackPanelActions& actions, float width, float height,
                    float scale);
