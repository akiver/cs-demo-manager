#include "playback_settings_menu.h"

#include <cmath>
#include <cstdio>

#include "playback_widgets.h"

static bool isDraggingBackgroundOpacity = false;
static float draggedBackgroundOpacity = overlayDefaultBackgroundOpacity;
static bool isDraggingScale = false;
static float draggedScale = overlayDefaultScale;
static bool isDraggingAutoHideDelay = false;
static float draggedAutoHideDelay = playbackPanelInitialAutoHideDelay;
// The delay the auto-hide checkbox turns back on, so unchecking and checking it again keeps the chosen value.
static float rememberedAutoHideDelay = playbackPanelInitialAutoHideDelay;

void DrawSettingsMenu(const PlaybackPanelState& state, PlaybackPanelActions& actions, ImVec2 anchor,
                      ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale) {
    if (state.autoHideDelay > 0.f) {
        rememberedAutoHideDelay = state.autoHideDelay;
    }

    bool isOpen = BeginPanelMenu("settings", anchor, panelPosition, panelSize, displaySize, scale);
    if (isOpen) {
        bool isXrayEnabled = state.isXrayEnabled;
        if (ImGui::Checkbox("X-Ray", &isXrayEnabled)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_XRAY));
        }
        bool isButtonsOverlayVisible = state.isButtonsOverlayVisible;
        if (ImGui::Checkbox("Pressed keys", &isButtonsOverlayVisible)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_BUTTONS_OVERLAY));
        }
        bool isMatchTimelineVisible = state.isMatchTimelineVisible;
        if (ImGui::Checkbox("Match timeline", &isMatchTimelineVisible)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_MATCH_TIMELINE));
        }
        bool isRoundTimelineVisible = state.isRoundTimelineVisible;
        if (ImGui::Checkbox("Round timeline", &isRoundTimelineVisible)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE));
        }
        ImGui::Indent();
        ImGui::BeginDisabled(!state.isRoundTimelineVisible);
        bool isRoundTimelineSpectatedOnly = state.isRoundTimelineSpectatedOnly;
        if (ImGui::Checkbox("Spectated player only", &isRoundTimelineSpectatedOnly)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_ROUND_TIMELINE_SPECTATED_ONLY));
        }
        ImGui::EndDisabled();
        if (ImGui::IsItemHovered(ImGuiHoveredFlags_AllowWhenDisabled)) {
            SetPanelTooltip(state,
                            "Show only the events of the spectated player on the round timeline, and go only "
                            "through their highlights and lowlights");
        }
        ImGui::Unindent();
        bool isFollowKillerEnabled = state.isFollowKillerEnabled;
        if (ImGui::Checkbox("Follow the killer", &isFollowKillerEnabled)) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_FOLLOW_KILLER));
        }
        if (ImGui::IsItemHovered()) {
            SetPanelTooltip(state,
                            "Spectate the killer after seeking to a kill with the next/previous kill arrows or a "
                            "click on a kill of the round timeline");
        }
        bool areTooltipsShown = state.areTooltipsEnabled;
        if (ImGui::Checkbox("Tooltips", &areTooltipsShown)) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_TOOLTIPS_ENABLED);
            action.areTooltipsEnabled = areTooltipsShown ? 1 : 0;
            AddAction(actions, action);
        }
        // Always shown, so the setting remains explained once tooltips are off.
        if (ImGui::IsItemHovered()) {
            ImGui::SetTooltip("Explain what the controls of the overlays do");
        }
        bool isAutoHideEnabled = state.autoHideDelay > 0.f;
        if (ImGui::Checkbox("Auto-hide", &isAutoHideEnabled)) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_AUTO_HIDE_DELAY);
            action.autoHideDelay = isAutoHideEnabled ? rememberedAutoHideDelay : 0.f;
            AddAction(actions, action);
        }
        if (ImGui::IsItemHovered()) {
            SetPanelTooltip(state, "Hide the panel while the mouse is idle, it comes back on the next move or click");
        }
        ImGui::Indent();
        ImGui::BeginDisabled(!isAutoHideEnabled);
        float shownAutoHideDelay = isDraggingAutoHideDelay ? draggedAutoHideDelay : rememberedAutoHideDelay;
        int autoHideSeconds = (int)roundf(shownAutoHideDelay);
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        ImGui::SliderInt("##autoHideDelay", &autoHideSeconds, playbackPanelMinAutoHideDelay,
                         playbackPanelMaxAutoHideDelay, "%d s",
                         ImGuiSliderFlags_AlwaysClamp | ImGuiSliderFlags_NoInput);
        isDraggingAutoHideDelay = ImGui::IsItemActive();
        if (isDraggingAutoHideDelay) {
            draggedAutoHideDelay = (float)autoHideSeconds;
        }
        if (ImGui::IsItemDeactivatedAfterEdit()) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_AUTO_HIDE_DELAY);
            action.autoHideDelay = (float)autoHideSeconds;
            AddAction(actions, action);
        }
        ImGui::EndDisabled();
        if (ImGui::IsItemHovered(ImGuiHoveredFlags_AllowWhenDisabled) && !isDraggingAutoHideDelay) {
            SetPanelTooltip(state, "How long the mouse must stay idle before the panel hides");
        }
        ImGui::Unindent();

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();
        ImGui::TextDisabled("SKIP LENGTH");
        for (int i = 0; i < playbackSkipSecondsChoiceCount; i++) {
            int seconds = playbackSkipSecondsChoices[i];
            char label[16];
            snprintf(label, sizeof(label), "%d s", seconds);
            if (i > 0) {
                ImGui::SameLine();
            }
            if (ImGui::RadioButton(label, state.skipSeconds == seconds)) {
                PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_SKIP_SECONDS);
                action.skipSeconds = seconds;
                AddAction(actions, action);
            }
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "How far the skip buttons of the panel go back or forward");
            }
        }

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();
        ImGui::TextDisabled("BACKGROUND OPACITY");
        float shownOpacity = isDraggingBackgroundOpacity ? draggedBackgroundOpacity : state.backgroundOpacity;
        int percent = (int)roundf(shownOpacity * 100.f);
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        ImGui::SliderInt("##backgroundOpacity", &percent, 0, 100, "%d%%",
                         ImGuiSliderFlags_AlwaysClamp | ImGuiSliderFlags_NoInput);
        isDraggingBackgroundOpacity = ImGui::IsItemActive();
        if (isDraggingBackgroundOpacity) {
            draggedBackgroundOpacity = (float)percent / 100.f;
        }
        if (ImGui::IsItemDeactivatedAfterEdit()) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_BACKGROUND_OPACITY);
            action.backgroundOpacity = (float)percent / 100.f;
            AddAction(actions, action);
        }
        if (ImGui::IsItemHovered() && !isDraggingBackgroundOpacity) {
            SetPanelTooltip(state, "How much of the game shows through the overlays");
        }

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();
        ImGui::TextDisabled("SIZE");
        // Unlike the opacity, the size isn't previewed while dragging: the slider would grow or shrink under the cursor
        // and the value would drift with it. It is applied on release.
        float shownScale = isDraggingScale ? draggedScale : state.scale;
        int scalePercent = (int)roundf(shownScale * 100.f);
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x);
        ImGui::SliderInt("##scale", &scalePercent, (int)roundf(overlayMinScale * 100.f),
                         (int)roundf(overlayMaxScale * 100.f), "%d%%",
                         ImGuiSliderFlags_AlwaysClamp | ImGuiSliderFlags_NoInput);
        isDraggingScale = ImGui::IsItemActive();
        if (isDraggingScale) {
            draggedScale = (float)scalePercent / 100.f;
        }
        if (ImGui::IsItemDeactivatedAfterEdit()) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_SCALE);
            action.scale = (float)scalePercent / 100.f;
            AddAction(actions, action);
        }
        if (ImGui::IsItemHovered() && !isDraggingScale) {
            SetPanelTooltip(state, "How large the overlays are drawn, on top of their scaling to the resolution");
        }
    } else {
        isDraggingBackgroundOpacity = false;
        isDraggingScale = false;
        isDraggingAutoHideDelay = false;
    }
    EndPanelMenu(isOpen);
}

float GetShownBackgroundOpacity(const PlaybackPanelState& state) {
    return isDraggingBackgroundOpacity ? draggedBackgroundOpacity : state.backgroundOpacity;
}
