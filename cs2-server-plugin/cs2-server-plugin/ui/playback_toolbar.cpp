#include "playback_toolbar.h"

#include <cfloat>
#include <cmath>
#include <cstdio>

#include "imgui_internal.h"
#include "maths.h"
#include "overlay_palette.h"
#include "playback_icons.h"
#include "playback_state.h"
#include "playback_widgets.h"

static bool isDraggingSpeed = false;
static int draggedSpeedIndex = 0;

constexpr float timeTextFontScale = 0.85f;

static void PushTimeTextFont() { ImGui::PushFont(NULL, ImGui::GetFontSize() * timeTextFontScale); }

float GetTimeTextWidth(const PlaybackPanelState& state) {
    PushTimeTextFont();
    float timeWidth = ImGui::CalcTextSize(state.totalTicks > 0 ? "00:00 / 00:00" : "00:00").x;
    float tickWidth = ImGui::CalcTextSize("0000000").x;
    ImGui::PopFont();

    return timeWidth > tickWidth ? timeWidth : tickWidth;
}

void DrawTimeText(const PlaybackPanelState& state, float width, float height, float scale) {
    char timeText[32];
    char tickText[32];
    int elapsedSeconds = (state.tick < 0 ? 0 : state.tick) / playbackTickrate;
    if (state.totalTicks > 0) {
        int totalSeconds = state.totalTicks / playbackTickrate;
        snprintf(timeText, sizeof(timeText), "%d:%02d / %d:%02d", elapsedSeconds / 60, elapsedSeconds % 60,
                 totalSeconds / 60, totalSeconds % 60);
    } else {
        snprintf(timeText, sizeof(timeText), "%d:%02d", elapsedSeconds / 60, elapsedSeconds % 60);
    }
    snprintf(tickText, sizeof(tickText), "%d", state.tick);

    ImVec2 position = ImGui::GetCursorScreenPos();
    if (ImGui::InvisibleButton("##time", ImVec2(width, height))) {
        ImGui::OpenPopup("goto");
    }

    ImDrawList* drawList = ImGui::GetWindowDrawList();
    bool isMenuOpen = ImGui::IsPopupOpen("goto");
    if (isMenuOpen || ImGui::IsItemHovered()) {
        OverlayColor color = isMenuOpen ? overlayActiveColor : overlayHoveredColor;
        drawList->AddRectFilled(position, ImVec2(position.x + width, position.y + height), color.ToU32(),
                                ImGui::GetStyle().FrameRounding);
    }
    if (ImGui::IsItemHovered() && !isMenuOpen) {
        SetPanelTooltip(state, "Go to a time, tick or round");
    }

    PushTimeTextFont();
    ImVec2 timeTextSize = ImGui::CalcTextSize(timeText);
    ImVec2 tickTextSize = ImGui::CalcTextSize(tickText);
    float lineSpacing = 2.f * scale;
    float textTop = position.y + (height - (timeTextSize.y + lineSpacing + tickTextSize.y)) * 0.5f;
    drawList->AddText(ImVec2(position.x + (width - timeTextSize.x) * 0.5f, textTop), overlayTextColor.ToU32(),
                      timeText);
    drawList->AddText(ImVec2(position.x + (width - tickTextSize.x) * 0.5f, textTop + timeTextSize.y + lineSpacing),
                      overlayTextColor.ToU32(), tickText);
    ImGui::PopFont();
}

bool HasRoundClock(const PlaybackTimeline& timeline) { return !timeline.rounds.empty(); }

float GetRoundClockWidth() { return ImGui::CalcTextSize("0:00").x; }

void DrawRoundClock(const PlaybackPanelState& state, const PlaybackTimeline& timeline, float width, float height) {
    ImVec2 position = ImGui::GetCursorScreenPos();
    ImGui::Dummy(ImVec2(width, height));

    RoundClock clock;
    int roundDurationSeconds = ResolveRoundDurationSeconds(state.roundDurationSeconds, timeline.roundDurationSeconds);
    int bombTimerSeconds = ResolveBombTimerSeconds(state.bombTimerSeconds);
    if (!GetRoundClock(timeline, state.tick, roundDurationSeconds, bombTimerSeconds, &clock)) {
        return;
    }

    int seconds = GetRoundClockSeconds(clock);
    char text[16];
    snprintf(text, sizeof(text), "%d:%02d", seconds / 60, seconds % 60);
    ImU32 color;
    if (clock.phase == ROUND_CLOCK_BOMB) {
        color = clock.isStopped ? WithAlpha(bombPlantColor, stoppedBombClockAlpha) : bombPlantColor;
    } else if (clock.phase == ROUND_CLOCK_FREEZE_TIME || clock.isStopped) {
        color = overlayMutedTextColor.ToU32();
    } else {
        color = overlayTextColor.ToU32();
    }
    ImVec2 textSize = ImGui::CalcTextSize(text);
    ImGui::GetWindowDrawList()->AddText(
        ImVec2(position.x + (width - textSize.x) * 0.5f, position.y + (height - textSize.y) * 0.5f), color, text);

    if (ImGui::IsItemHovered()) {
        if (clock.phase == ROUND_CLOCK_FREEZE_TIME) {
            SetPanelTooltip(state, "Freeze time left");
        } else if (clock.phase == ROUND_CLOCK_BOMB) {
            if (!clock.isStopped) {
                SetPanelTooltip(state, "Time left before the bomb explodes");
            } else if (clock.ticksLeft == 0) {
                SetPanelTooltip(state, "The bomb exploded");
            } else {
                SetPanelTooltip(state, "The bomb was defused");
            }
        } else if (clock.isStopped) {
            SetPanelTooltip(state, "Round time left when the round ended");
        } else {
            SetPanelTooltip(state, "Round time left");
        }
    }
}

void DrawLoopButton(const PlaybackPanelState& state, ImVec2 size, PlaybackPanelActions& actions) {
    bool hasStart = state.loopStartTick >= 0;
    bool hasEnd = state.loopEndTick >= 0;
    if (ToggleButton("##loop", hasEnd, size)) {
        if (hasEnd) {
            AddAction(actions, MakeAction(PLAYBACK_ACTION_CLEAR_LOOP));
        } else {
            AddLoopMarkAction(actions, hasStart, state.tick);
        }
    }
    ImU32 iconColor = hasStart ? ImGui::GetColorU32(ImGuiCol_Text) : overlayMutedTextColor.ToU32();
    DrawLoopIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), iconColor);

    if (ImGui::IsItemHovered()) {
        int startSeconds = state.loopStartTick / playbackTickrate;
        int endSeconds = state.loopEndTick / playbackTickrate;
        if (hasEnd) {
            SetPanelTooltip(state, "Looping from %d:%02d to %d:%02d, click to clear", startSeconds / 60,
                            startSeconds % 60, endSeconds / 60, endSeconds % 60);
        } else if (hasStart) {
            SetPanelTooltip(state, "Loop start set at %d:%02d, click to set the end at the current time",
                            startSeconds / 60, startSeconds % 60);
        } else {
            SetPanelTooltip(state, "Set the loop start at the current time");
        }
    }
}

void DrawSequenceButton(const PlaybackPanelState& state, ImVec2 size, PlaybackPanelActions& actions) {
    bool hasStart = state.sequenceStartTick >= 0;
    bool isEnabled = state.isAppConnected;
    bool isClicked = isEnabled ? ToggleButton("##sequence", hasStart, size) : SkipButton("##sequence", size, false);
    if (isClicked) {
        AddSequenceMarkAction(actions, hasStart, state.tick);
    } else if (hasStart && ImGui::IsItemClicked(ImGuiMouseButton_Right)) {
        AddAction(actions, MakeAction(PLAYBACK_ACTION_CLEAR_SEQUENCE_START));
    }
    DrawRecordIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), hasStart,
                   GetSkipIconColor(isEnabled));

    if (ImGui::IsItemHovered()) {
        if (!isEnabled) {
            SetPanelTooltip(state, "Video sequences need CS Demo Manager to be running");
        } else if (hasStart) {
            int startSeconds = state.sequenceStartTick / playbackTickrate;
            SetPanelTooltip(state,
                            "Video sequence started at %d:%02d, click to end it at the current time and add it to "
                            "the video page of the app, right click to cancel",
                            startSeconds / 60, startSeconds % 60);
        } else {
            SetPanelTooltip(state, "Start a video sequence at the current time");
        }
    }
}

void DrawFrameStepButton(const char* id, const PlaybackPanelState& state, bool isNext, ImVec2 size,
                         PlaybackPanelActions& actions) {
    bool isEnabled = state.isPaused;
    if (SkipButton(id, size, isEnabled)) {
        AddSeekAction(actions, state.tick + (isNext ? 1 : -1));
    }
    DrawFrameStepIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isNext,
                      GetSkipIconColor(isEnabled));

    if (ImGui::IsItemHovered()) {
        if (isEnabled) {
            SetPanelTooltip(state, isNext ? "Next frame" : "Previous frame");
        } else {
            SetPanelTooltip(state, "Pause to step frame by frame");
        }
    }
}

void DrawPlayerCycleButton(const char* id, const PlaybackPanelState& state, bool isNext, ImVec2 size,
                           PlaybackPanelActions& actions) {
    int slot = GetAdjacentPlayerSlot(state, isNext);
    bool isEnabled = slot >= 0;
    if (SkipButton(id, size, isEnabled)) {
        PlaybackAction action = MakeAction(PLAYBACK_ACTION_SPECTATE_PLAYER);
        action.slot = slot;
        AddAction(actions, action);
    }
    DrawChevronIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isNext,
                    GetSkipIconColor(isEnabled));

    if (ImGui::IsItemHovered()) {
        const char* name = isEnabled ? GetPlayerName(state, slot) : NULL;
        if (name != NULL) {
            SetPanelTooltip(state, "Spectate %s", name);
        } else {
            SetPanelTooltip(state, isNext ? "Next player" : "Previous player");
        }
    }
}

void DrawDragHandle(const PlaybackPanelState& state, ImVec2 size, ImVec2 panelPosition, ImVec2 panelSize,
                    ImVec2 displaySize) {
    ImGui::InvisibleButton("##drag", size);
    bool isDragging = ImGui::IsItemActive() && ImGui::IsMouseDragging(ImGuiMouseButton_Left, 0.f);
    if (isDragging) {
        ImVec2 delta = ImGui::GetIO().MouseDelta;
        ImVec2 position =
            ImVec2(ClampToRange(panelPosition.x + delta.x, 0.f, std::max(0.f, displaySize.x - panelSize.x)),
                   ClampToRange(panelPosition.y + delta.y, 0.f, std::max(0.f, displaySize.y - panelSize.y)));
        ImGui::SetWindowPos(position);
    }

    ImVec2 position = ImGui::GetItemRectMin();
    ImDrawList* drawList = ImGui::GetWindowDrawList();
    if (isDragging || ImGui::IsItemHovered()) {
        OverlayColor color = isDragging ? overlayPressedColor : overlayHoveredColor;
        drawList->AddRectFilled(position, ImVec2(position.x + size.x, position.y + size.y), color.ToU32(),
                                ImGui::GetStyle().FrameRounding);
    }
    if (ImGui::IsItemHovered() && !isDragging) {
        SetPanelTooltip(state, "Drag to move the panel");
    }

    // Two columns of three dots.
    ImU32 dotColor = isDragging || ImGui::IsItemHovered() ? overlayTextColor.ToU32() : overlayMutedTextColor.ToU32();
    float dotRadius = size.y * 0.05f;
    float columnOffset = size.y * 0.1f;
    float rowOffset = size.y * 0.16f;
    ImVec2 center = ImVec2(position.x + size.x * 0.5f, position.y + size.y * 0.5f);
    for (int column = -1; column <= 1; column += 2) {
        for (int row = -1; row <= 1; row++) {
            drawList->AddCircleFilled(
                ImVec2(center.x + columnOffset * (float)column, center.y + rowOffset * (float)row), dotRadius, dotColor,
                8);
        }
    }
}

void DrawSpectatedPlayerButton(const PlaybackPanelState& state, ImVec2 size) {
    const char* name = state.currentCameraIndex < 0 ? GetSpectatedPlayerName(state) : NULL;
    bool hasName = name != NULL;
    if (ToggleButton("##players", ImGui::IsPopupOpen("players"), size)) {
        ImGui::OpenPopup("players");
    }
    ImVec2 position = ImGui::GetItemRectMin();
    ImVec2 buttonSize = ImGui::GetItemRectSize();
    if (ImGui::IsItemHovered()) {
        if (hasName) {
            SetPanelTooltip(state, "Spectating %s, click to pick a player", name);
        } else {
            SetPanelTooltip(state, "Pick a player to spectate");
        }
    }

    ImDrawList* drawList = ImGui::GetWindowDrawList();
    const char* label = hasName ? name : "Players";
    ImU32 color = hasName ? overlayTextColor.ToU32() : overlayMutedTextColor.ToU32();
    float paddingX = ImGui::GetStyle().FramePadding.x;
    // A small caret on the right says the button opens a menu.
    float caretWidth = ImGui::GetFontSize() * 0.4f;
    float caretRight = position.x + buttonSize.x - paddingX;
    float caretTop = position.y + buttonSize.y * 0.5f - caretWidth * 0.25f;
    drawList->AddTriangleFilled(ImVec2(caretRight - caretWidth, caretTop), ImVec2(caretRight, caretTop),
                                ImVec2(caretRight - caretWidth * 0.5f, caretTop + caretWidth * 0.5f), color);

    ImVec2 textSize = ImGui::CalcTextSize(label);
    ImVec2 textMin = ImVec2(position.x + paddingX, position.y + (buttonSize.y - textSize.y) * 0.5f);
    ImVec2 textMax = ImVec2(caretRight - caretWidth - paddingX * 0.5f, textMin.y + textSize.y);
    float availableWidth = textMax.x - textMin.x;
    if (textSize.x < availableWidth) {
        textMin.x += (availableWidth - textSize.x) * 0.5f;
    }
    ImGui::PushStyleColor(ImGuiCol_Text, color);
    ImGui::RenderTextEllipsis(drawList, textMin, textMax, textMax.x, label, NULL, &textSize);
    ImGui::PopStyleColor();
}

void DrawPlayerLockButton(const PlaybackPanelState& state, ImVec2 size, PlaybackPanelActions& actions) {
    bool isLocked = state.lockedSteamId != 0;
    const char* spectatedName = state.currentCameraIndex < 0 ? GetSpectatedPlayerName(state) : NULL;
    bool isEnabled = isLocked || spectatedName != NULL;
    bool isClicked = isEnabled ? ToggleButton("##lock", isLocked, size) : SkipButton("##lock", size, false);
    if (isClicked) {
        AddAction(actions, MakeAction(PLAYBACK_ACTION_TOGGLE_PLAYER_LOCK));
    }
    DrawLockIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isLocked,
                 GetSkipIconColor(isEnabled));

    if (ImGui::IsItemHovered()) {
        const char* lockedName = isLocked ? GetPlayerName(state, state.lockedSlot) : NULL;
        if (lockedName != NULL) {
            SetPanelTooltip(state, "Camera locked on %s, they are spectated again when they respawn, click to unlock",
                            lockedName);
        } else if (isLocked) {
            SetPanelTooltip(state, "Camera locked on a player who isn't in the game, click to unlock");
        } else if (isEnabled) {
            SetPanelTooltip(state, "Lock the camera on %s to spectate them again when they respawn", spectatedName);
        } else {
            SetPanelTooltip(state, "Spectate a player to lock the camera on them");
        }
    }
}

int DrawSpeedSlider(const PlaybackPanelState& state, PlaybackPanelActions& actions, float width, float height,
                    float scale) {
    ImVec2 position = ImGui::GetCursorScreenPos();
    ImGui::InvisibleButton("##speed", ImVec2(width, height));
    bool isActive = ImGui::IsItemActive();
    bool isHovered = ImGui::IsItemHovered();

    float endFontSize = ImGui::GetFontSize() * 0.8f;
    ImFont* font = ImGui::GetFont();
    char slowestLabel[16];
    char fastestLabel[16];
    FormatSpeedLabel(slowestLabel, sizeof(slowestLabel), 0);
    FormatSpeedLabel(fastestLabel, sizeof(fastestLabel), playbackSpeedCount - 1);
    float slowestLabelWidth = font->CalcTextSizeA(endFontSize, FLT_MAX, 0.f, slowestLabel).x;
    float fastestLabelWidth = font->CalcTextSizeA(endFontSize, FLT_MAX, 0.f, fastestLabel).x;

    // The end labels are centered under the first and last notches, so the track is inset to keep them inside.
    float trackLeft = position.x + slowestLabelWidth * 0.5f;
    float trackRight = position.x + width - fastestLabelWidth * 0.5f;
    float trackWidth = trackRight - trackLeft;
    float trackHeight = 6.f * scale;
    float notchHeight = 4.f * scale;
    float notchSpacing = 2.f * scale;
    float stackHeight = trackHeight + notchSpacing + notchHeight + notchSpacing + endFontSize;
    float trackTop = position.y + (height - stackHeight) * 0.5f;
    float trackCenterY = trackTop + trackHeight * 0.5f;
    float notchTop = trackTop + trackHeight + notchSpacing;
    float labelTop = notchTop + notchHeight + notchSpacing;

    int speedIndex = isDraggingSpeed ? draggedSpeedIndex : GetSpeedIndex(state.speed);
    if (isActive) {
        float mouseFraction = ClampToRange((ImGui::GetIO().MousePos.x - trackLeft) / trackWidth, 0.f, 1.f);
        int draggedIndex = (int)roundf(mouseFraction * (float)(playbackSpeedCount - 1));
        if (draggedIndex != speedIndex) {
            PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_SPEED);
            action.speed = playbackSpeeds[draggedIndex];
            AddAction(actions, action);
        }
        speedIndex = draggedIndex;
    }
    isDraggingSpeed = isActive;
    draggedSpeedIndex = speedIndex;

    ImDrawList* drawList = ImGui::GetWindowDrawList();
    float knobX = trackLeft + trackWidth * (float)speedIndex / (float)(playbackSpeedCount - 1);
    float rounding = trackHeight * 0.5f;
    drawList->AddRectFilled(ImVec2(trackLeft, trackTop), ImVec2(trackRight, trackTop + trackHeight),
                            overlayIdleColor.ToU32(), rounding);
    drawList->AddRectFilled(ImVec2(trackLeft, trackTop), ImVec2(knobX, trackTop + trackHeight),
                            overlayActiveColor.ToU32(), rounding);
    for (int i = 0; i < playbackSpeedCount; i++) {
        float x = trackLeft + trackWidth * (float)i / (float)(playbackSpeedCount - 1);
        drawList->AddLine(ImVec2(x, notchTop), ImVec2(x, notchTop + notchHeight), overlayMutedTextColor.ToU32(),
                          1.f * scale);
    }
    drawList->AddText(font, endFontSize, ImVec2(trackLeft - slowestLabelWidth * 0.5f, labelTop),
                      overlayMutedTextColor.ToU32(), slowestLabel);
    drawList->AddText(font, endFontSize, ImVec2(trackRight - fastestLabelWidth * 0.5f, labelTop),
                      overlayMutedTextColor.ToU32(), fastestLabel);
    drawList->AddCircleFilled(ImVec2(knobX, trackCenterY), (isHovered || isActive ? 8.f : 6.f) * scale,
                              overlayTextColor.ToU32());

    if (isHovered && !isActive) {
        SetPanelTooltip(state, "Playback speed");
    }

    return speedIndex;
}
