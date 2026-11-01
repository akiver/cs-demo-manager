#include "icvar.h"
#include "log.h"
#include "playback_cameras.h"

CON_COMMAND(csdm_camera_next, "Moves the view to the next camera saved for the map, back to the first after the last") {
    if (!GoToPlaybackCameraRelative(1)) {
        Log("No cameras for this map");
    }
}
