#pragma once

#include <cstdint>
#include <string>

#include "ui/playback_timeline.h"

struct PlaybackState {
    int tick;
    int totalTicks;
    bool isPaused;
    float speed;
};

void SetPlaybackPanelVisible(bool visible);
bool IsPlaybackPanelVisible();

// Moves the panel's bottom center to these fractions of the display size, clamped to [0, 1], so it keeps its place
// when the resolution changes.
void SetPlaybackPanelPosition(float fractionX, float fractionY);
void GetPlaybackPanelPosition(float* fractionX, float* fractionY);
void SetPlaybackMatchTimelineVisible(bool visible);
bool IsPlaybackMatchTimelineVisible();
void SetPlaybackRoundTimelineVisible(bool visible);
bool IsPlaybackRoundTimelineVisible();
void SetPlaybackRoundTimelineSpectatedOnly(bool isSpectatedOnly);
bool IsPlaybackRoundTimelineSpectatedOnly();
void SetPlaybackFollowKillerEnabled(bool isEnabled);
bool IsPlaybackFollowKillerEnabled();

// The playback loops between two ticks once both are set, it goes back to the start when it passes the end. The loop
// is cleared when the playback stops.
void SetPlaybackLoopStart(int tick);
// Without a start, sets the start instead. Before the start, the two are swapped. At the start, it is ignored.
void SetPlaybackLoopEnd(int tick);
// Sets both ends at once, in any order. False without a demo playing or when the two ticks are equal.
bool SetPlaybackLoop(int startTick, int endTick);
void ClearPlaybackLoop();
// Both are -1 while not set.
void GetPlaybackLoop(int* startTick, int* endTick);

// Used to add video sequences from the game to the app.
void SetPlaybackSequenceStart(int tick);
bool EndPlaybackSequence(int tick);
void ClearPlaybackSequenceStart();
// Drops the pending start on the user's request, and tells them with a toast.
void CancelPlaybackSequence();

void SetPlaybackPanelAutoHideDelay(float seconds);
float GetPlaybackPanelAutoHideDelay();
void SetPlaybackSkipSeconds(int seconds);
int GetPlaybackSkipSeconds();

void SetPlaybackPanelState(const PlaybackState& state);
void UpdatePlaybackSpectatedPlayer();
void ResetPlaybackSpectatedPlayer();
void SpectatePlaybackPlayer(int slot);
void SetPlaybackDemoPath(const std::string& path);
void SetPlaybackDemoChecksum(const std::string& checksum);
void SetPlaybackVoiceState(uint32_t maskLow, uint32_t maskHigh, const PlaybackPlayer* players, int playerCount);
// Queues the engine commands matching the action. Safe to call from any thread.
void ApplyPlaybackAction(const PlaybackAction& action);
void SetPlaybackTimeline(const PlaybackTimeline& timeline);
// Loads the file containing the timeline data the app wrote to <demoPath>.timeline.json when the demo has been
// analyzed, for the seek bar of the panel.
void LoadPlaybackTimelineFile(const std::string& demoPath);
// Logs the round time the timeline file gives the round clock.
void LogPlaybackRoundClockState();

bool SeekPlaybackToRound(int roundNumber);
bool SeekPlaybackToTick(int tick);
// A negative number of seconds goes back.
bool SeekPlaybackBySeconds(float seconds);
bool SeekPlaybackToNextRound();
bool SeekPlaybackToPreviousRound();
bool SeekPlaybackToNextKill();
bool SeekPlaybackToPreviousKill();
bool SeekPlaybackToNextHighlight();
bool SeekPlaybackToPreviousHighlight();
bool SeekPlaybackToNextLowlight();
bool SeekPlaybackToPreviousLowlight();

#ifdef _WIN32
void PlaybackOverlayDrawFrame();
#else
// Looks up the panel's exports in the Vulkan layer and replays the current state into it. Returns false when an
// export is missing.
bool PlaybackOverlayConnectLayer(void* layerLib);
// Disconnecting hides the panel and forgets the layer.
void PlaybackOverlayDisconnectLayer();
#endif
