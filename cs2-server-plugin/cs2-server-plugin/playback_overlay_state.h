#pragma once

#include <atomic>
#include <cstdint>
#include <mutex>
#include <string>

#include "player_controllers.h"
#include "ui/playback_controls.h"
#include "ui/playback_timeline.h"

// The state of the playback overlay, shared by the files that make it up: what the panel shows, kept up to date by the
// plugin, read by the panel every frame on Windows and pushed to the Vulkan layer on Linux. The rest of the plugin
// goes through playback_overlay.h.

extern std::atomic<bool> isPlaybackPanelVisible;
extern std::atomic<int> playbackTick;
extern std::atomic<int> playbackTotalTicks;
extern std::atomic<float> playbackSpeed;
extern std::atomic<bool> isXrayEnabled;
extern std::atomic<bool> isPlaybackPaused;
extern std::atomic<bool> isMatchTimelineVisible;
extern std::atomic<bool> isRoundTimelineVisible;
extern std::atomic<bool> isRoundTimelineSpectatedOnly;
extern std::atomic<bool> isFollowKillerEnabled;
extern std::atomic<float> autoHideDelay;
extern std::atomic<int> skipSeconds;
extern std::atomic<int> loopStartTick;
extern std::atomic<int> loopEndTick;
// -1 while no video sequence is pending, in playback_sequence.cpp.
extern std::atomic<int> sequenceStartTick;

extern std::mutex demoPathMutex;
extern std::string playbackDemoPath;
// The checksum of the match the demo was analyzed into, from its timeline file. Empty when it has none, which is
// when the demo hasn't been analyzed by the app.
extern std::string playbackDemoChecksum;

extern std::atomic<uint32_t> voiceMaskLow;
extern std::atomic<uint32_t> voiceMaskHigh;
extern std::mutex playbackPlayersMutex;
extern PlaybackPlayer playbackPlayers[playbackMaxPlayers];
extern int playbackPlayerCount;

extern std::mutex timelineMutex;
extern PlaybackTimeline playbackTimeline;

extern std::atomic<uint64_t> spectatedSteamId;
extern std::atomic<int> spectatedSlot;
extern std::mutex spectatedPlayerMutex;
extern char spectatedPlayerName[playerNameSize];

// Send state changes to the Linux overlay layer, in playback_overlay_linux.cpp. No-ops on Windows, where the panel
// reads the globals every frame.
void PushVoiceState();
void PushTimeline();
void PushPanelState();

// A seek takes a few frames to land, the panel shows its target meanwhile.
// Returns the tick the panel shows, and spectates the player a seek was asked to follow once it reaches its target.
int ResolvePlaybackTick(int tick);
// Seeks to the tick, and spectates the player with `followSteamId` once there, nobody for 0.
void QueueSeek(int tick, uint64_t followSteamId);
// Sends the playback back to the loop start once it passes the end. Called every frame with the demo tick.
void EnforcePlaybackLoop(int tick, bool isPaused);
// Drops the player a pending seek was to spectate.
void ForgetPendingSpectate();

// On until the spec_show_xray convar says otherwise, its default.
bool ReadXrayEnabled();
