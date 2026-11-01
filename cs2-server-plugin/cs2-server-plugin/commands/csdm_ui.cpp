#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"

CON_COMMAND(csdm_ui, "Toggles the CS:DM demo playback UI") {
    bool isVisible = !IsPlaybackPanelVisible();
    SetPlaybackPanelVisible(isVisible);
    Log("Playback panel %s", isVisible ? "shown" : "hidden");
}
