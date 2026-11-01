#include "playback_cameras.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <mutex>
#include <nlohmann/json.hpp>
#include <vector>

#include "log.h"
#include "plugin.h"
#include "string_utils.h"

using nlohmann::json;
using std::string;

static std::mutex camerasMutex;
static PlaybackCamera cameras[playbackMaxCameras];
static int cameraCount = 0;
static int currentCameraIndex = -1;

// Sends the cameras to the Linux overlay layer. No-op on Windows, where the panel reads them every frame.
static void PushCameras();

static void SetCameras(const std::vector<PlaybackCamera>& newCameras) {
    {
        std::lock_guard<std::mutex> lock(camerasMutex);
        cameraCount = (int)newCameras.size() > playbackMaxCameras ? playbackMaxCameras : (int)newCameras.size();
        if (cameraCount > 0) {
            memcpy(cameras, newCameras.data(), sizeof(PlaybackCamera) * cameraCount);
        }
        currentCameraIndex = -1;
    }
    PushCameras();
}

// Packs a "#rrggbb" color as IM_COL32 does: red in the low byte, then green, blue and an opaque alpha. Returns 0, a
// transparent color, for anything else.
static uint32_t ParseHexColor(const string& hex) {
    if (hex.size() != 7 || hex[0] != '#') {
        return 0;
    }

    char* end = NULL;
    unsigned long rgb = strtoul(hex.c_str() + 1, &end, 16);
    if (end != hex.c_str() + hex.size()) {
        return 0;
    }

    uint32_t red = (rgb >> 16) & 0xFF;
    uint32_t green = (rgb >> 8) & 0xFF;
    uint32_t blue = rgb & 0xFF;

    return red | (green << 8) | (blue << 16) | (0xFFu << 24);
}

void LoadPlaybackCamerasFile(const std::string& demoPath) {
    std::vector<PlaybackCamera> newCameras;
    string camerasPath = demoPath + ".cameras.json";
    std::ifstream file(camerasPath);
    if (!file.good()) {
        Log("Cameras file not found at %s", camerasPath.c_str());
        SetCameras(newCameras);
        return;
    }

    try {
        json data = json::parse(file);
        for (auto& camera : data) {
            PlaybackCamera playbackCamera = {};
            CopyUtf8Truncated(playbackCamera.name, camera.value("name", string()));
            playbackCamera.x = camera.value("x", 0.f);
            playbackCamera.y = camera.value("y", 0.f);
            playbackCamera.z = camera.value("z", 0.f);
            playbackCamera.pitch = camera.value("pitch", 0.f);
            playbackCamera.yaw = camera.value("yaw", 0.f);
            playbackCamera.color = ParseHexColor(camera.value("color", string()));
            newCameras.push_back(playbackCamera);
        }
        if ((int)newCameras.size() > playbackMaxCameras) {
            Log("%zu cameras found, only the first %d are listed", newCameras.size(), playbackMaxCameras);
        }
        Log("Cameras loaded: %zu", newCameras.size());
    } catch (const std::exception& exception) {
        Log("Cameras file %s can't be read: %s", camerasPath.c_str(), exception.what());
        newCameras.clear();
    }

    SetCameras(newCameras);
}

int GetPlaybackCameras(PlaybackCamera* outCameras, int* currentIndex) {
    std::lock_guard<std::mutex> lock(camerasMutex);
    if (cameraCount > 0) {
        memcpy(outCameras, cameras, sizeof(PlaybackCamera) * cameraCount);
    }
    *currentIndex = currentCameraIndex;

    return cameraCount;
}

bool GoToPlaybackCamera(int index) {
    char command[160];
    {
        std::lock_guard<std::mutex> lock(camerasMutex);
        if (index < 0 || index >= cameraCount) {
            return false;
        }

        const PlaybackCamera& camera = cameras[index];
        snprintf(command, sizeof(command), "spec_goto %g %g %g %g %g", camera.x, camera.y, camera.z, camera.pitch,
                 camera.yaw);
        currentCameraIndex = index;
    }
    // Since the 2026-10-14 CS2 update the demo free camera keeps its own position and ignores the one spec_goto
    // teleports the observer to, so it is turned off first.
    // It stays off while a camera is in use, LeavePlaybackCamera turns it back on.
    // https://github.com/ValveSoftware/csgo-osx-linux/issues/4660
    QueueEngineCommand("cl_demo_freecam 0");
    QueueEngineCommand(command);
    PushCameras();

    return true;
}

bool GoToPlaybackCameraRelative(int offset) {
    int index;
    {
        std::lock_guard<std::mutex> lock(camerasMutex);
        if (cameraCount == 0) {
            return false;
        }

        if (currentCameraIndex < 0) {
            index = offset > 0 ? 0 : cameraCount - 1;
        } else {
            index = ((currentCameraIndex + offset) % cameraCount + cameraCount) % cameraCount;
        }
    }

    return GoToPlaybackCamera(index);
}

void LeavePlaybackCamera() {
    {
        std::lock_guard<std::mutex> lock(camerasMutex);
        currentCameraIndex = -1;
    }
    // Leaves the free camera spec_goto puts the observer in and gives the demo free camera back.
    QueueEngineCommand("spec_mode 1");
    QueueEngineCommand("cl_demo_freecam 1");
    PushCameras();
}

int FindPlaybackCamera(const std::string& target) {
    std::lock_guard<std::mutex> lock(camerasMutex);
    if (IsDigits(target)) {
        int number = atoi(target.c_str());
        return number >= 1 && number <= cameraCount ? number - 1 : -1;
    }

    // A full name wins over a name that only starts with the target, e.g. "A" over "A long".
    for (int i = 0; i < cameraCount; i++) {
        if (EqualsNoCase(cameras[i].name, target)) {
            return i;
        }
    }
    for (int i = 0; i < cameraCount; i++) {
        if (StartsWithNoCase(cameras[i].name, target)) {
            return i;
        }
    }

    return -1;
}

#ifdef _WIN32

static void PushCameras() {}

#else

#include <dlfcn.h>

typedef void (*OverlaySetPlaybackCamerasFn)(int cameraCount, const PlaybackCamera* cameras, int currentIndex);

static OverlaySetPlaybackCamerasFn layerSetPlaybackCameras = NULL;

static void PushCameras() {
    if (layerSetPlaybackCameras == NULL) {
        return;
    }

    std::lock_guard<std::mutex> lock(camerasMutex);
    layerSetPlaybackCameras(cameraCount, cameras, currentCameraIndex);
}

bool PlaybackCamerasConnectLayer(void* layerLib) {
    layerSetPlaybackCameras = (OverlaySetPlaybackCamerasFn)dlsym(layerLib, "CsdmOverlaySetPlaybackCameras");
    if (layerSetPlaybackCameras == NULL) {
        return false;
    }

    PushCameras();

    return true;
}

void PlaybackCamerasDisconnectLayer() { layerSetPlaybackCameras = NULL; }

#endif
