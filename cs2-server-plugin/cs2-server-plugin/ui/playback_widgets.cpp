#include "playback_widgets.h"

#include <algorithm>
#include <cfloat>
#include <cstdarg>
#include <cstdio>

#include "imgui_internal.h"
#include "maths.h"
#include "overlay_palette.h"
#include "playback_state.h"

void AddAction(PlaybackPanelActions& actions, const PlaybackAction& action) {
    if (actions.count < playbackMaxActionsPerFrame) {
        actions.actions[actions.count++] = action;
    }
}

PlaybackAction MakeAction(PlaybackActionType type) {
    PlaybackAction action = {};
    action.type = type;

    return action;
}

void AddSeekAction(PlaybackPanelActions& actions, int tick) {
    PlaybackAction action = MakeAction(PLAYBACK_ACTION_SEEK);
    action.tick = tick < 0 ? 0 : tick;
    AddAction(actions, action);
}

void AddLoopMarkAction(PlaybackPanelActions& actions, bool isEnd, int tick) {
    PlaybackAction action = MakeAction(isEnd ? PLAYBACK_ACTION_SET_LOOP_END : PLAYBACK_ACTION_SET_LOOP_START);
    action.tick = tick < 0 ? 0 : tick;
    AddAction(actions, action);
}

void AddSequenceMarkAction(PlaybackPanelActions& actions, bool isEnd, int tick) {
    PlaybackAction action = MakeAction(isEnd ? PLAYBACK_ACTION_END_SEQUENCE : PLAYBACK_ACTION_SET_SEQUENCE_START);
    action.tick = tick < 0 ? 0 : tick;
    AddAction(actions, action);
}

void AddKillSeekAction(PlaybackPanelActions& actions, const TimelineKill& kill) {
    PlaybackAction action = MakeAction(PLAYBACK_ACTION_GOTO_KILL);
    action.kill.tick = GetKillSeekTick(kill);
    action.kill.killerSteamId = kill.killerSteamId;
    AddAction(actions, action);
}

void AddSequenceSeekAction(PlaybackPanelActions& actions, const TimelineSequence& sequence) {
    PlaybackAction action = MakeAction(PLAYBACK_ACTION_GOTO_SEQUENCE);
    action.sequence.tick = sequence.startTick;
    action.sequence.steamId = sequence.steamId;
    AddAction(actions, action);
}

void AddVoiceMaskAction(PlaybackPanelActions& actions, uint32_t maskLow, uint32_t maskHigh) {
    PlaybackAction action = MakeAction(PLAYBACK_ACTION_SET_VOICE_MASK);
    action.voiceMask.low = maskLow;
    action.voiceMask.high = maskHigh;
    AddAction(actions, action);
}

bool ToggleButton(const char* label, bool isOn, ImVec2 size) {
    if (isOn) {
        ImGui::PushStyleColor(ImGuiCol_Button, overlayActiveColor.ToVec4());
        ImGui::PushStyleColor(ImGuiCol_ButtonHovered, overlayActiveHoveredColor.ToVec4());
    }

    bool isClicked = ImGui::Button(label, size);

    if (isOn) {
        ImGui::PopStyleColor(2);
    }

    return isClicked;
}

float GetButtonWidth(const char* label) {
    return ImGui::CalcTextSize(label).x + ImGui::GetStyle().FramePadding.x * 2.f;
}

ImU32 GetTeamColor(int team) {
    if (team == playbackTeamCT) {
        return overlayCounterTerroristColor.ToU32();
    }
    if (team == playbackTeamT) {
        return overlayTerroristColor.ToU32();
    }

    return overlayOtherTeamColor.ToU32();
}

ImU32 WithAlpha(ImU32 color, int alpha) { return (color & ~IM_COL32_A_MASK) | ((ImU32)alpha << IM_COL32_A_SHIFT); }

void SetPanelTooltip(const PlaybackPanelState& state, const char* format, ...) {
    if (!state.areTooltipsEnabled) {
        return;
    }

    va_list arguments;
    va_start(arguments, format);
    ImGui::SetTooltipV(format, arguments);
    va_end(arguments);
}

void KeepTooltipInDisplay() {
    ImVec2 position = ImGui::GetWindowPos();
    ImVec2 size = ImGui::GetWindowSize();
    ImVec2 displaySize = ImGui::GetIO().DisplaySize;
    ImVec2 clampedPosition = ImVec2(ClampToRange(position.x, 0.f, std::max(0.f, displaySize.x - size.x)),
                                    ClampToRange(position.y, 0.f, std::max(0.f, displaySize.y - size.y)));
    if (clampedPosition.x != position.x || clampedPosition.y != position.y) {
        ImGui::SetWindowPos(clampedPosition);
    }
}

void FormatTickTime(char* text, size_t size, int tick) {
    int seconds = tick / playbackTickrate;
    snprintf(text, size, "%d:%02d (%d)", seconds / 60, seconds % 60, tick);
}

void DrawRoundTooltip(const TimelineRound& round, int roundNumber, int tick) {
    ImGui::BeginTooltip();
    KeepTooltipInDisplay();
    ImGui::Text("Round %d", roundNumber);
    ImGui::SameLine();
    char time[tickTimeTextSize];
    FormatTickTime(time, sizeof(time), tick);
    ImGui::TextDisabled("%s", time);

    // Skipped when the timeline file has no teams. The columns are measured from the text rather than laid out with an
    // ImGui table: a table stretches to the width the tooltip had on the previous frame, which cuts off the last
    // column.
    const TimelineRoundTeam* teams[] = {&round.teamA, &round.teamB};
    if (round.teamA.team != 0 && round.teamB.team != 0) {
        char scoreTexts[2][12];
        float nameWidth = 0.f;
        float scoreWidth = 0.f;
        for (int i = 0; i < 2; i++) {
            snprintf(scoreTexts[i], sizeof(scoreTexts[i]), "%d", teams[i]->score);
            nameWidth = std::max(nameWidth, ImGui::CalcTextSize(GetRoundTeamName(*teams[i])).x);
            scoreWidth = std::max(scoreWidth, ImGui::CalcTextSize(scoreTexts[i]).x);
        }

        float columnSpacing = ImGui::GetStyle().ItemSpacing.x * 2.f;
        for (int i = 0; i < 2; i++) {
            ImVec4 color = ImGui::ColorConvertU32ToFloat4(GetTeamColor(teams[i]->team));
            float rowX = ImGui::GetCursorPosX();
            ImGui::TextColored(color, "%s", GetRoundTeamName(*teams[i]));
            // The scores are right-aligned so their digits line up.
            ImGui::SameLine(rowX + nameWidth + columnSpacing + scoreWidth - ImGui::CalcTextSize(scoreTexts[i]).x);
            ImGui::TextColored(color, "%s", scoreTexts[i]);
            ImGui::SameLine(rowX + nameWidth + scoreWidth + columnSpacing * 2.f);
            ImGui::TextDisabled("%s", GetEconomyTypeText(teams[i]->economyType));
        }
    }

    const char* endReasonText = GetRoundEndReasonText(round.endReason);
    if (endReasonText != NULL) {
        ImGui::TextColored(ImGui::ColorConvertU32ToFloat4(GetTeamColor(round.winnerTeam)), "%s", endReasonText);
    }
    ImGui::EndTooltip();
}

void DrawLoopMarks(ImDrawList* drawList, float startX, float endX, bool hasStartMark, bool hasEndMark, float top,
                   float bottom, float scale) {
    float thickness = 1.5f * scale;
    if (endX >= 0.f) {
        drawList->AddRectFilled(ImVec2(startX, top), ImVec2(endX, bottom), loopBandColor);
    }
    if (hasStartMark) {
        drawList->AddLine(ImVec2(startX, top), ImVec2(startX, bottom), loopMarkColor, thickness);
    }
    if (endX >= 0.f && hasEndMark) {
        drawList->AddLine(ImVec2(endX, top), ImVec2(endX, bottom), loopMarkColor, thickness);
    }
}

void DrawSequenceMarks(ImDrawList* drawList, float startX, float currentX, bool hasStartMark, float top, float bottom,
                       float scale) {
    float thickness = 1.5f * scale;
    float bandLeft = startX < currentX ? startX : currentX;
    float bandRight = startX < currentX ? currentX : startX;
    if (bandRight > bandLeft) {
        drawList->AddRectFilled(ImVec2(bandLeft, top), ImVec2(bandRight, bottom), sequenceBandColor);
    }
    if (hasStartMark) {
        drawList->AddLine(ImVec2(startX, top), ImVec2(startX, bottom), sequenceMarkColor, thickness);
        // The flag points to the side the sequence extends to.
        float flagWidth = (startX <= currentX ? 1.f : -1.f) * 5.f * scale;
        float flagHeight = 5.f * scale;
        drawList->AddTriangleFilled(ImVec2(startX, top), ImVec2(startX + flagWidth, top + flagHeight * 0.5f),
                                    ImVec2(startX, top + flagHeight), sequenceMarkColor);
    }
}

bool BeginPanelMenu(const char* id, ImVec2 anchor, ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize,
                    float scale) {
    float gap = 8.f * scale;
    float spacing = 4.f * scale;
    bool isBelow = panelPosition.y < displaySize.y * 0.5f;
    float menuEdge = isBelow ? panelPosition.y + panelSize.y + gap : panelPosition.y - gap;
    // The position is set by hand, so ImGui doesn't keep the menu on screen itself.
    char popupName[32];
    ImFormatString(popupName, sizeof(popupName), "##Popup_%08x", ImGui::GetID(id));
    ImGuiWindow* menuWindow = ImGui::FindWindowByName(popupName);
    float menuWidth = menuWindow != NULL ? menuWindow->Size.x : 0.f;
    float x = std::max(std::min(anchor.x, displaySize.x - gap - menuWidth), gap);
    ImGui::SetNextWindowPos(ImVec2(x, menuEdge), ImGuiCond_Always, ImVec2(0.f, isBelow ? 0.f : 1.f));
    float roomForMenu = (isBelow ? displaySize.y - menuEdge : menuEdge) - gap;
    float maxHeight = std::max(roomForMenu, 120.f * scale);
    ImGui::SetNextWindowSizeConstraints(ImVec2(240.f * scale, 0.f), ImVec2(FLT_MAX, maxHeight));
    ImGui::PushStyleVar(ImGuiStyleVar_FramePadding, ImVec2(4.f * scale, 4.f * scale));
    ImGui::PushStyleVar(ImGuiStyleVar_ItemSpacing, ImVec2(spacing, spacing));
    ImGui::PushStyleVar(ImGuiStyleVar_ScrollbarSize, 10.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_ScrollbarRounding, 5.f * scale);
    ImGuiWindowFlags flags = ImGuiWindowFlags_NoMove | ImGuiWindowFlags_NoNav | ImGuiWindowFlags_NoSavedSettings;

    return ImGui::BeginPopup(id, flags);
}

void EndPanelMenu(bool isOpen) {
    if (isOpen) {
        ImGui::EndPopup();
    }
    ImGui::PopStyleVar(4);
}

constexpr float disabledSkipButtonAlpha = 0.2f;
constexpr int disabledSkipIconAlpha = 75;

bool SkipButton(const char* id, ImVec2 size, bool isEnabled) {
    if (isEnabled) {
        return ImGui::Button(id, size);
    }

    ImVec4 buttonColor = overlayIdleColor.ToVec4();
    buttonColor.w = disabledSkipButtonAlpha;
    ImGui::PushStyleColor(ImGuiCol_Button, buttonColor);
    ImGui::PushStyleColor(ImGuiCol_ButtonHovered, buttonColor);
    ImGui::PushStyleColor(ImGuiCol_ButtonActive, buttonColor);
    ImGui::Button(id, size);
    ImGui::PopStyleColor(3);

    return false;
}

ImU32 GetSkipIconColor(bool isEnabled) {
    return isEnabled ? ImGui::GetColorU32(ImGuiCol_Text)
                     : WithAlpha(overlayMutedTextColor.ToU32(), disabledSkipIconAlpha);
}
