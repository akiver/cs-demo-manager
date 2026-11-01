#include "settings.h"

#include <fstream>
#include <nlohmann/json.hpp>
#include <string>

#include "buttons_overlay.h"
#include "convars.h"
#include "log.h"
#include "overlay.h"
#include "playback_overlay.h"
#include "plugin.h"
#include "voice_indicator.h"

using nlohmann::json;
using std::string;

// The keys are the names of the convars and commands that change the settings.
static const char* const booleanConvarNames[] = {"csdm_buttons_overlay",
                                                 "csdm_voice_indicator",
                                                 "csdm_match_timeline",
                                                 "csdm_round_timeline",
                                                 "csdm_round_timeline_spectated_only",
                                                 "csdm_follow_killer",
                                                 "csdm_overlay_tooltips"};
static const char* const floatConvarNames[] = {"csdm_overlay_background_opacity", "csdm_overlay_scale",
                                               "csdm_playback_overlay_auto_hide_delay"};
static const char* const intConvarNames[] = {"csdm_playback_skip_seconds"};
// The panel positions, stored as [x, y] arrays.
constexpr const char* buttonsOverlayPositionKey = "csdm_buttons_overlay_pos";
constexpr const char* playbackPanelPositionKey = "csdm_playback_overlay_pos";
constexpr const char* voiceIndicatorPositionKey = "csdm_voice_indicator_pos";

// Dragging a panel moves it every frame, checking every so often writes the file a few times per drag at most.
constexpr int SETTINGS_CHECK_FRAMES = 128;
static int framesSinceSettingsCheck = 0;
static json savedSettings;

static string GetSettingsFilePath() { return gameDirectory + "/csgo/cfg/csdm_settings.json"; }

static json GetSettings() {
    json settings;
    settings["csdm_buttons_overlay"] = IsButtonsOverlayVisible();
    settings["csdm_voice_indicator"] = IsVoiceIndicatorVisible();
    settings["csdm_match_timeline"] = IsPlaybackMatchTimelineVisible();
    settings["csdm_round_timeline"] = IsPlaybackRoundTimelineVisible();
    settings["csdm_round_timeline_spectated_only"] = IsPlaybackRoundTimelineSpectatedOnly();
    settings["csdm_follow_killer"] = IsPlaybackFollowKillerEnabled();
    settings["csdm_overlay_background_opacity"] = GetOverlayBackgroundOpacity();
    settings["csdm_overlay_scale"] = GetOverlayScale();
    settings["csdm_overlay_tooltips"] = AreOverlayTooltipsEnabled();
    settings["csdm_playback_overlay_auto_hide_delay"] = GetPlaybackPanelAutoHideDelay();
    settings["csdm_playback_skip_seconds"] = GetPlaybackSkipSeconds();

    // Read from the panels rather than from their convars, which follow the panels a frame late.
    float x = 0.f;
    float y = 0.f;
    GetButtonsOverlayPosition(&x, &y);
    settings[buttonsOverlayPositionKey] = {x, y};
    GetPlaybackPanelPosition(&x, &y);
    settings[playbackPanelPositionKey] = {x, y};
    GetVoiceIndicatorPosition(&x, &y);
    settings[voiceIndicatorPositionKey] = {x, y};

    return settings;
}

static bool ReadPosition(const json& settings, const char* key, float* x, float* y) {
    auto it = settings.find(key);
    if (it == settings.end() || !it->is_array() || it->size() != 2 || !(*it)[0].is_number() || !(*it)[1].is_number()) {
        return false;
    }

    *x = (*it)[0].get<float>();
    *y = (*it)[1].get<float>();

    return true;
}

static void ApplySettings(const json& settings) {
    // Set through the convars so their values match the state and their callbacks apply it.
    for (const char* name : booleanConvarNames) {
        auto it = settings.find(name);
        if (it == settings.end() || !it->is_boolean()) {
            continue;
        }

        CachedConVar convar = {name};
        WriteConVarBool(convar, it->get<bool>());
    }
    for (const char* name : floatConvarNames) {
        auto it = settings.find(name);
        if (it == settings.end() || !it->is_number()) {
            continue;
        }

        CachedConVar convar = {name};
        WriteConVarFloat(convar, it->get<float>());
    }
    for (const char* name : intConvarNames) {
        auto it = settings.find(name);
        if (it == settings.end() || !it->is_number_integer()) {
            continue;
        }

        CachedConVar convar = {name};
        WriteConVarInt(convar, it->get<int32_t>());
    }

    for (const char* key : {buttonsOverlayPositionKey, playbackPanelPositionKey, voiceIndicatorPositionKey}) {
        float x = 0.f;
        float y = 0.f;
        if (!ReadPosition(settings, key, &x, &y)) {
            continue;
        }

        CachedConVar convar = {key};
        WriteConVarVector2D(convar, x, y);
    }
}

void LoadSettings() {
    string path = GetSettingsFilePath();
    std::ifstream file(path);
    if (file.good()) {
        try {
            json settings = json::parse(file);
            if (settings.is_object()) {
                ApplySettings(settings);
                Log("Settings loaded from %s", path.c_str());
            }
        } catch (const std::exception& exception) {
            Log("Settings file %s can't be read: %s", path.c_str(), exception.what());
        }
    }

    // Read back rather than kept from the file so a file missing a setting or with an invalid value isn't rewritten
    // until something changes.
    savedSettings = GetSettings();
}

void SaveSettings() {
    json settings = GetSettings();
    if (settings == savedSettings) {
        return;
    }

    string path = GetSettingsFilePath();
    std::ofstream file(path, std::ios::trunc);
    if (!file.good()) {
        Log("Settings file %s can't be written", path.c_str());
        return;
    }

    file << settings.dump(2);
    savedSettings = settings;
    Log("Settings saved to %s", path.c_str());
}

void UpdateSettingsFile() {
    if (++framesSinceSettingsCheck < SETTINGS_CHECK_FRAMES) {
        return;
    }
    framesSinceSettingsCheck = 0;

    SaveSettings();
}
