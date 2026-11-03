#include "playback_panel.h"

#include <algorithm>
#include <atomic>
#include <cfloat>
#include <cstdio>

#include "imgui.h"
#include "maths.h"
#include "overlay_palette.h"
#include "playback_goto_menu.h"
#include "playback_icons.h"
#include "playback_match_timeline.h"
#include "playback_menus.h"
#include "playback_round_timeline.h"
#include "playback_settings_menu.h"
#include "playback_state.h"
#include "playback_toolbar.h"
#include "playback_widgets.h"

constexpr float playbackPanelSizeScale = 1.1f;

static_assert(overlayPanelBackgroundColor.alpha == (int)(overlayDefaultBackgroundOpacity * 255.f + 0.5f),
              "The default background opacity must match the palette");

// Last drawn state, used to keep the panel's bottom center at the same relative place when the display or panel
// size changes (ImGui keeps the top left corner in pixels).
static ImVec2 lastDisplaySize;
static ImVec2 lastPanelPosition;
static ImVec2 lastPanelSize;
static int lastDrawnFrame = -1;
static bool lastIsPlaying = false;
static bool lastIsMatchTimelineVisible = true;
static bool lastIsRoundTimelineVisible = true;
static float lastScale = overlayDefaultScale;
// Where to move the panel's bottom center, as fractions of the display size, while repositionFramesLeft > 0.
static ImVec2 repositionFraction;
static int repositionFramesLeft = 0;

static std::atomic<bool> hasRequestedPlacement{false};
static std::atomic<float> requestedFractionX{playbackPanelDefaultFractionX};
static std::atomic<float> requestedFractionY{playbackPanelDefaultFractionY};
static std::atomic<float> drawnFractionX{playbackPanelDefaultFractionX};
static std::atomic<float> drawnFractionY{playbackPanelDefaultFractionY};

// The panel hides after the mouse has been idle for state.autoHideDelay seconds, and comes back on the next mouse move
// or click. It stays while the mouse is over a panel, a menu is open or a control is held.
static double lastMouseActivityTime = 0.0;
static ImVec2 lastMousePosition = ImVec2(-FLT_MAX, -FLT_MAX);
static int lastAutoHideFrame = -1;
static float lastAutoHideDelay = -1.f;
// Whether a menu was open or a control held on the last frame, only known once the frame is drawn.
static bool wasInteracting = false;

static bool IsPanelAutoHidden(const PlaybackPanelState& state) {
    ImGuiIO& io = ImGui::GetIO();
    double now = ImGui::GetTime();
    int frame = ImGui::GetFrameCount();

    bool isResuming = frame != lastAutoHideFrame + 1 || state.autoHideDelay != lastAutoHideDelay;
    lastAutoHideFrame = frame;
    lastAutoHideDelay = state.autoHideDelay;

    bool hasMouseMoved =
        ImGui::IsMousePosValid() && (io.MousePos.x != lastMousePosition.x || io.MousePos.y != lastMousePosition.y);
    lastMousePosition = io.MousePos;
    bool isMouseBusy = ImGui::IsAnyMouseDown() || ImGui::IsWindowHovered(ImGuiHoveredFlags_AnyWindow);
    if (isResuming || hasMouseMoved || isMouseBusy || wasInteracting) {
        lastMouseActivityTime = now;
    }

    return state.autoHideDelay > 0.f && now - lastMouseActivityTime >= state.autoHideDelay;
}

PlaybackPanelActions DrawPlaybackPanel(const PlaybackPanelState& state, const PlaybackTimeline& timeline) {
    PlaybackPanelActions actions = {};

    ImGuiIO& io = ImGui::GetIO();
    ImVec2 displaySize = io.DisplaySize;
    if (displaySize.x <= 0.f || displaySize.y <= 0.f) {
        return actions;
    }

    if (IsPanelAutoHidden(state)) {
        return actions;
    }

    // Keep the same proportions whatever the resolution is, 1080p being the reference, times the factor the user set.
    // Everything is also drawn larger than ImGui's defaults: its 13px font is hard to read over the game.
    float displayScale = displaySize.y / 1080.f * state.scale;
    float scale = displayScale * playbackPanelSizeScale;
    ImGuiStyle& style = ImGui::GetStyle();
    ImGui::PushFont(NULL, style.FontSizeBase * scale);
    float fontSize = ImGui::GetFontSize();
    float controlHeight = 34.f * scale;
    float spacing = 8.f * scale;
    float padding = 10.f * scale;

    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(padding, padding));
    ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, 8.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 2.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_PopupRounding, 8.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_PopupBorderSize, 2.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_FramePadding, ImVec2(spacing, (controlHeight - fontSize) * 0.5f));
    ImGui::PushStyleVar(ImGuiStyleVar_FrameRounding, 4.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_FrameBorderSize, 0.f);
    ImGui::PushStyleVar(ImGuiStyleVar_ItemSpacing, ImVec2(spacing, spacing));
    const int styleVarCount = 9;

    // Only the backgrounds are see-through, the controls on them stay readable.
    float backgroundOpacity = GetShownBackgroundOpacity(state);
    ImGui::PushStyleColor(ImGuiCol_WindowBg, ToBackgroundColor(overlayPanelBackgroundColor, backgroundOpacity));
    ImGui::PushStyleColor(ImGuiCol_PopupBg, ToBackgroundColor(overlayMenuBackgroundColor, backgroundOpacity));
    ImGui::PushStyleColor(ImGuiCol_Border, overlayBorderColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_Button, overlayIdleColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_ButtonHovered, overlayHoveredColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_ButtonActive, overlayPressedColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_FrameBg, overlayIdleColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_FrameBgHovered, overlayHoveredColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_FrameBgActive, overlayPressedColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_CheckMark, overlayTextColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_Text, overlayTextColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_TextDisabled, overlayMutedTextColor.ToVec4());
    const int styleColorCount = 12;

    // When the display size or the layout changes, move the panel back to the same relative place, see lastDisplaySize.
    bool displayChanged = displaySize.x != lastDisplaySize.x || displaySize.y != lastDisplaySize.y;
    bool layoutChanged = state.isPlaying != lastIsPlaying ||
                         state.isMatchTimelineVisible != lastIsMatchTimelineVisible ||
                         state.isRoundTimelineVisible != lastIsRoundTimelineVisible || state.scale != lastScale;
    if (lastDisplaySize.x > 0.f && (displayChanged || layoutChanged)) {
        repositionFraction = ImVec2((lastPanelPosition.x + lastPanelSize.x * 0.5f) / lastDisplaySize.x,
                                    (lastPanelPosition.y + lastPanelSize.y) / lastDisplaySize.y);
        // Two frames, because the panel is auto-sized and its size at the new scale is only known on the second one.
        repositionFramesLeft = 2;
    }
    lastDisplaySize = displaySize;
    lastIsPlaying = state.isPlaying;
    lastIsMatchTimelineVisible = state.isMatchTimelineVisible;
    lastIsRoundTimelineVisible = state.isRoundTimelineVisible;
    lastScale = state.scale;

    // A placement requested with MovePlaybackPanelTo takes precedence. The request is only cleared once the panel has
    // been drawn there, so GetPlaybackPanelPlacement never answers with the old place in between.
    bool isApplyingRequest = hasRequestedPlacement;
    if (isApplyingRequest) {
        repositionFraction = ImVec2(requestedFractionX, requestedFractionY);
        repositionFramesLeft = 2;
    }

    ImVec2 pivot = ImVec2(0.5f, 1.f);
    if (repositionFramesLeft > 0) {
        repositionFramesLeft--;
        ImVec2 position = ImVec2(repositionFraction.x * displaySize.x, repositionFraction.y * displaySize.y);
        // Once the panel has been drawn, its size is known and the target can be clamped to keep it fully on screen.
        if (lastPanelSize.x > 0.f) {
            position.x = ClampToRange(position.x, lastPanelSize.x * 0.5f, displaySize.x - lastPanelSize.x * 0.5f);
            position.y = ClampToRange(position.y, lastPanelSize.y, displaySize.y);
        }
        ImGui::SetNextWindowPos(position, ImGuiCond_Always, pivot);
    } else {
        // Against the bottom edge the first time the panel is drawn, then wherever ImGui has it.
        ImGui::SetNextWindowPos(
            ImVec2(displaySize.x * playbackPanelDefaultFractionX, displaySize.y * playbackPanelDefaultFractionY),
            ImGuiCond_Once, pivot);
    }

    // The window stays movable: ImGui moves it when its background is dragged.
    ImGuiWindowFlags flags = ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoScrollbar |
                             ImGuiWindowFlags_NoScrollWithMouse | ImGuiWindowFlags_NoCollapse |
                             ImGuiWindowFlags_AlwaysAutoResize | ImGuiWindowFlags_NoSavedSettings |
                             ImGuiWindowFlags_NoNav;
    if (ImGui::Begin("csdm_playback", NULL, flags)) {
        ImVec2 panelPosition = ImGui::GetWindowPos();
        ImVec2 panelSize = ImGui::GetWindowSize();
        lastPanelPosition = panelPosition;
        lastPanelSize = panelSize;
        lastDrawnFrame = ImGui::GetFrameCount();
        drawnFractionX = (panelPosition.x + panelSize.x * 0.5f) / displaySize.x;
        drawnFractionY = (panelPosition.y + panelSize.y) / displaySize.y;
        if (isApplyingRequest) {
            hasRequestedPlacement = false;
        }

        if (!state.isPlaying) {
            if (ImGui::Button("##play", ImVec2(controlHeight, controlHeight))) {
                AddAction(actions, MakeAction(PLAYBACK_ACTION_PLAY_LAST_DEMO));
            }
            DrawPlayPauseIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), true);
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "Play the demo again");
            }
        } else {
            // The speed label is as wide as the widest speed so the row doesn't shift when the speed changes.
            float speedSliderWidth = controlHeight * 5.f;
            float speedLabelWidth = 0.f;
            for (int i = 0; i < playbackSpeedCount; i++) {
                char speedLabel[16];
                FormatSpeedLabel(speedLabel, sizeof(speedLabel), i);
                float labelWidth = ImGui::CalcTextSize(speedLabel).x;
                if (labelWidth > speedLabelWidth) {
                    speedLabelWidth = labelWidth;
                }
            }

            float groupSpacing = spacing * 2.f;
            // The arrows and the name of the spectated player are one widget, closer to each other than the rest.
            float playersSpacing = 2.f * scale;
            float playerNameWidth = controlHeight * 4.f;
            float playersWidth = controlHeight + playersSpacing + playerNameWidth + playersSpacing + controlHeight;
            float textWidth = GetTimeTextWidth(state) + spacing * 2.f;
            float roundClockWidth = HasRoundClock(timeline) ? spacing + GetRoundClockWidth() : 0.f;
            float dragHandleWidth = controlHeight * 0.5f;
            float rowWidth = dragHandleWidth + spacing + controlHeight + spacing + controlHeight + spacing +
                             controlHeight + spacing + GetButtonWidth("-10s") + spacing + GetButtonWidth("+10s") +
                             spacing + controlHeight + spacing + controlHeight + spacing + controlHeight +
                             groupSpacing + textWidth + roundClockWidth + groupSpacing + speedSliderWidth + spacing +
                             speedLabelWidth + groupSpacing + controlHeight + spacing + playersWidth + spacing +
                             controlHeight + spacing + controlHeight + spacing + controlHeight;

            // With a timeline, the panel takes 75% of the display width so a whole match fits, with the controls
            // centered under it. The width is capped at its 16:9 value, otherwise on an ultrawide the bar would stretch
            // across the screen with the controls lost in the middle. Without a timeline, the panel is as wide as the
            // controls.
            bool hasTimeline = state.isMatchTimelineVisible || state.isRoundTimelineVisible;
            float minimumContentWidth = hasTimeline ? displaySize.x * 0.75f : 0.f;
            float maximumContentWidth = 1440.f * displayScale;
            if (minimumContentWidth > maximumContentWidth) {
                minimumContentWidth = maximumContentWidth;
            }
            float contentWidth = rowWidth > minimumContentWidth ? rowWidth : minimumContentWidth;

            // Without the total ticks a click can't be mapped to a tick.
            if (state.totalTicks > 0) {
                if (state.isMatchTimelineVisible) {
                    DrawMatchTimeline(state, timeline, actions, contentWidth, scale);
                }
                if (state.isRoundTimelineVisible) {
                    DrawRoundTimeline(state, timeline, actions, contentWidth, scale);
                }
            } else {
                ImGui::Dummy(ImVec2(contentWidth, 0.f));
            }

            ImGui::SetCursorPosX(ImGui::GetCursorPosX() + (contentWidth - rowWidth) * 0.5f);
            DrawDragHandle(state, ImVec2(dragHandleWidth, controlHeight), panelPosition, panelSize, displaySize);

            ImGui::SameLine();
            if (ImGui::Button("##pause", ImVec2(controlHeight, controlHeight))) {
                AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_PAUSE));
            }
            DrawPlayPauseIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(),
                              state.isPaused);
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, state.isPaused ? "Resume the playback" : "Pause the playback");
            }

            ImGui::SameLine();
            if (ImGui::Button("##stop", ImVec2(controlHeight, controlHeight))) {
                AddAction(actions, MakeAction(PLAYBACK_ACTION_END_PLAYBACK));
            }
            DrawStopIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize());
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "End the playback");
            }

            ImVec2 frameStepButtonSize = ImVec2(controlHeight, controlHeight);
            ImGui::SameLine();
            DrawFrameStepButton("##previous_frame", state, false, frameStepButtonSize, actions);

            int skippedFrames = state.skipSeconds * playbackTickrate;
            // The labels follow the setting, the IDs after ### keep the buttons the same widgets meanwhile.
            char skipLabel[32];
            ImGui::SameLine();
            snprintf(skipLabel, sizeof(skipLabel), "-%ds###skip_back", state.skipSeconds);
            if (ImGui::Button(skipLabel)) {
                AddSeekAction(actions, state.tick - skippedFrames);
            }
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "Go back %d seconds", state.skipSeconds);
            }
            ImGui::SameLine();
            snprintf(skipLabel, sizeof(skipLabel), "+%ds###skip_forward", state.skipSeconds);
            if (ImGui::Button(skipLabel)) {
                AddSeekAction(actions, state.tick + skippedFrames);
            }
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "Go forward %d seconds", state.skipSeconds);
            }

            ImGui::SameLine();
            DrawFrameStepButton("##next_frame", state, true, frameStepButtonSize, actions);

            ImGui::SameLine();
            DrawLoopButton(state, ImVec2(controlHeight, controlHeight), actions);

            ImGui::SameLine();
            DrawSequenceButton(state, ImVec2(controlHeight, controlHeight), actions);

            ImGui::SameLine(0.f, groupSpacing);
            DrawTimeText(state, textWidth, controlHeight, scale);
            ImVec2 goToAnchor = ImGui::GetItemRectMin();
            if (HasRoundClock(timeline)) {
                ImGui::SameLine();
                DrawRoundClock(state, timeline, GetRoundClockWidth(), controlHeight);
            }

            ImGui::SameLine(0.f, groupSpacing);
            int speedIndex = DrawSpeedSlider(state, actions, speedSliderWidth, controlHeight, scale);

            ImGui::SameLine();
            char speedLabel[16];
            FormatSpeedLabel(speedLabel, sizeof(speedLabel), speedIndex);
            ImVec2 speedLabelPosition = ImGui::GetCursorScreenPos();
            ImGui::Dummy(ImVec2(speedLabelWidth, controlHeight));
            ImGui::GetWindowDrawList()->AddText(
                ImVec2(speedLabelPosition.x, speedLabelPosition.y + (controlHeight - fontSize) * 0.5f),
                overlayTextColor.ToU32(), speedLabel);

            ImGui::SameLine(0.f, groupSpacing);
            DrawPlayerCycleButton("##previous_player", state, false, ImVec2(controlHeight, controlHeight), actions);
            ImGui::SameLine(0.f, playersSpacing);
            DrawSpectatedPlayerButton(state, ImVec2(playerNameWidth, controlHeight));
            ImVec2 playersAnchor = ImGui::GetItemRectMin();
            ImGui::SameLine(0.f, playersSpacing);
            DrawPlayerCycleButton("##next_player", state, true, ImVec2(controlHeight, controlHeight), actions);

            ImGui::SameLine();
            DrawPlayerLockButton(state, ImVec2(controlHeight, controlHeight), actions);

            ImGui::SameLine();
            if (ToggleButton("##voice", ImGui::IsPopupOpen("voice"), ImVec2(controlHeight, controlHeight))) {
                ImGui::OpenPopup("voice");
            }
            DrawMicrophoneIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize());
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "Voices");
            }
            ImVec2 voiceAnchor = ImGui::GetItemRectMin();

            ImGui::SameLine();
            if (ToggleButton("##cameras", ImGui::IsPopupOpen("cameras"), ImVec2(controlHeight, controlHeight))) {
                ImGui::OpenPopup("cameras");
            }
            DrawCameraIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize());
            if (ImGui::IsItemHovered()) {
                SetPanelTooltip(state, "Cameras");
            }
            ImVec2 camerasAnchor = ImGui::GetItemRectMin();

            ImGui::SameLine();
            if (ImGui::Button("##settings", ImVec2(controlHeight, controlHeight))) {
                ImGui::OpenPopup("settings");
            }
            DrawGearIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize());
            ImVec2 settingsAnchor = ImGui::GetItemRectMin();

            DrawGoToMenu(state, timeline, actions, goToAnchor, panelPosition, panelSize, displaySize, scale);
            DrawCamerasMenu(state, actions, camerasAnchor, panelPosition, panelSize, displaySize, scale);
            DrawPlayersMenu(state, actions, playersAnchor, panelPosition, panelSize, displaySize, scale);
            DrawVoiceMenu(state, actions, voiceAnchor, panelPosition, panelSize, displaySize, scale);
            DrawSettingsMenu(state, actions, settingsAnchor, panelPosition, panelSize, displaySize, scale);
        }
    }
    ImGui::End();

    wasInteracting = ImGui::IsPopupOpen("", ImGuiPopupFlags_AnyPopupId | ImGuiPopupFlags_AnyPopupLevel) ||
                     ImGui::IsAnyItemActive() || IsMatchTimelineSeeking() || IsRoundTimelineSeeking();

    ImGui::PopStyleColor(styleColorCount);
    ImGui::PopStyleVar(styleVarCount);
    ImGui::PopFont();

    return actions;
}

void MovePlaybackPanelTo(float fractionX, float fractionY) {
    requestedFractionX = ClampToRange(fractionX, 0.f, 1.f);
    requestedFractionY = ClampToRange(fractionY, 0.f, 1.f);
    hasRequestedPlacement = true;
}

bool GetPlaybackPanelRect(ImVec2* position, ImVec2* size) {
    if (lastDrawnFrame != ImGui::GetFrameCount()) {
        return false;
    }

    *position = lastPanelPosition;
    *size = lastPanelSize;

    return true;
}

void GetPlaybackPanelPlacement(float* fractionX, float* fractionY) {
    if (hasRequestedPlacement) {
        *fractionX = requestedFractionX;
        *fractionY = requestedFractionY;

        return;
    }

    *fractionX = drawnFractionX;
    *fractionY = drawnFractionY;
}
