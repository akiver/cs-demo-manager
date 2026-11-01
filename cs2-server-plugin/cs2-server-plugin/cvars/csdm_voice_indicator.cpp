#include "icvar.h"
#include "log.h"
#include "voice_indicator.h"

static void OnVoiceIndicatorChanged(CConVar<bool>* convar, CSplitScreenSlot slot, const bool* newValue,
                                    const bool* oldValue) {
    bool isEnabled = *newValue;
    SetVoiceIndicatorVisible(isEnabled);
    Log("Voice indicator %s", isEnabled ? "enabled" : "disabled");
}

static CConVar<bool> csdm_voice_indicator("csdm_voice_indicator", FCVAR_RELEASE,
                                          "Shows who is talking in the overlay, the panel can be moved by dragging it.",
                                          true, OnVoiceIndicatorChanged);
