#pragma once

#include "playback_panel.h"

// The timeline of the current round, with its events. Clicking it seeks within the round, the buttons on both sides
// jump to the previous/next round, highlight and kill.
void DrawRoundTimeline(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                       float width, float scale);

// Whether the user is dragging the playhead along the round timeline.
bool IsRoundTimelineSeeking();
