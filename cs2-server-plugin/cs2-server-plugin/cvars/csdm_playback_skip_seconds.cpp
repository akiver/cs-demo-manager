#include "icvar.h"
#include "log.h"
#include "playback_overlay.h"
#include "ui/playback_controls.h"

static void OnPlaybackSkipSecondsChanged(CConVar<int32>* convar, CSplitScreenSlot slot, const int32* newValue,
                                         const int32* oldValue) {
    int seconds = *newValue;
    SetPlaybackSkipSeconds(seconds);
    Log("Playback skip length set to %d seconds", seconds);
}

static CConVar<int32> csdm_playback_skip_seconds(
    "csdm_playback_skip_seconds", FCVAR_RELEASE,
    "Seconds the skip buttons of the playback panel go back or forward, from 1 to 300.", playbackDefaultSkipSeconds,
    true, playbackMinSkipSeconds, true, playbackMaxSkipSeconds, OnPlaybackSkipSecondsChanged);
