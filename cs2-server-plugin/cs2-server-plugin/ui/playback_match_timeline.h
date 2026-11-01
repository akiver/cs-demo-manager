#pragma once

#include "playback_panel.h"

// The timeline of the whole match: a strip of its rounds with the spectated player's kills above and the seek track
// under, which a click or a drag seeks along.
void DrawMatchTimeline(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                       float width, float scale);

// Whether the user is dragging the playhead along the match timeline.
bool IsMatchTimelineSeeking();
