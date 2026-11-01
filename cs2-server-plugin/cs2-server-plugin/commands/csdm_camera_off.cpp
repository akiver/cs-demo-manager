#include "icvar.h"
#include "playback_cameras.h"

CON_COMMAND(csdm_camera_off, "Leaves the cameras to follow the players again") { LeavePlaybackCamera(); }
