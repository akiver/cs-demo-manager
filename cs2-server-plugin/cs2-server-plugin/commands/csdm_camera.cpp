#include <string>

#include "icvar.h"
#include "log.h"
#include "playback_cameras.h"

CON_COMMAND(csdm_camera,
            "Moves the view to a camera saved for the map, usage: csdm_camera <target> where the target is the number "
            "of the camera or the start of its name. Use csdm_cameras to list them") {
    if (args.ArgC() < 2) {
        Log("Usage: csdm_camera <number or name>");
        return;
    }

    // Unquoted names with spaces come as several arguments.
    std::string target = args[1];
    for (int i = 2; i < args.ArgC(); i++) {
        target += " ";
        target += args[i];
    }

    int index = FindPlaybackCamera(target);
    if (index < 0 || !GoToPlaybackCamera(index)) {
        Log("No camera matches \"%s\"", target.c_str());
    }
}
