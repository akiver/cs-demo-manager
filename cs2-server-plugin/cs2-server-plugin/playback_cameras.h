#pragma once

#include <string>

#include "ui/playback_controls.h"

// Loads the cameras the app wrote to <demoPath>.cameras.json for the demo's map. A missing or unreadable file leaves
// no cameras.
void LoadPlaybackCamerasFile(const std::string& demoPath);

// Copies the cameras into `cameras`, which must hold playbackMaxCameras, and returns how many there are.
// `currentIndex` receives the index of the camera the view was last moved to, -1 when following the players.
int GetPlaybackCameras(PlaybackCamera* cameras, int* currentIndex);

// Moves the view to the camera at `index`. Returns false when there is no such camera. Safe to call from any thread.
bool GoToPlaybackCamera(int index);
// Moves the view to the camera `offset` cameras away from the current one, wrapping around. From the players, 1 goes
// to the first camera and -1 to the last. Returns false without cameras. Safe to call from any thread.
bool GoToPlaybackCameraRelative(int offset);
// Leaves the cameras to follow the players again. Safe to call from any thread.
void LeavePlaybackCamera();
// Whether the view is on a camera rather than following the players. Safe to call from any thread.
bool IsOnPlaybackCamera();

// The index of the camera matching `target`, its 1-based number or its name, or the start of it, ignoring case.
// -1 when no camera matches.
int FindPlaybackCamera(const std::string& target);

#ifndef _WIN32
// Looks up the cameras export in the Vulkan layer and pushes the cameras into it. Returns false when it is missing.
bool PlaybackCamerasConnectLayer(void* layerLib);
void PlaybackCamerasDisconnectLayer();
#endif
