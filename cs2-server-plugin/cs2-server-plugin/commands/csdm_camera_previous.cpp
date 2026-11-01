#include "icvar.h"
#include "log.h"
#include "playback_cameras.h"

CON_COMMAND(csdm_camera_previous,
            "Moves the view to the previous camera saved for the map, back to the last before the first") {
    if (!GoToPlaybackCameraRelative(-1)) {
        Log("No cameras for this map");
    }
}
