#include "icvar.h"
#include "log.h"
#include "playback_cameras.h"

CON_COMMAND(csdm_cameras, "Prints the cameras saved for the map, the current one marked with a *") {
    PlaybackCamera cameras[playbackMaxCameras];
    int currentIndex = -1;
    int cameraCount = GetPlaybackCameras(cameras, &currentIndex);
    if (cameraCount == 0) {
        Log("No cameras for this map, add some from the CS:DM settings");
        return;
    }

    Log("  %-3s %-32s %s", "#", "Name", "Position");
    for (int i = 0; i < cameraCount; i++) {
        const PlaybackCamera& camera = cameras[i];
        Log("%c %-3d %-32s %g %g %g %g %g", i == currentIndex ? '*' : ' ', i + 1, camera.name, camera.x, camera.y,
            camera.z, camera.pitch, camera.yaw);
    }
}
