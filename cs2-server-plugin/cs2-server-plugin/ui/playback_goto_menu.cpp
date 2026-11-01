#include "playback_goto_menu.h"

#include <algorithm>
#include <cstdio>

#include "overlay_palette.h"
#include "playback_widgets.h"

static int FilterGoToCharacter(ImGuiInputTextCallbackData* data) {
    bool isAllowed = (data->EventChar >= '0' && data->EventChar <= '9') || data->EventChar == ':';

    return isAllowed ? 0 : 1;
}

// Rows of 12 rounds put each half of an MR12 match, the CS2 format, on its own row.
constexpr int goToRoundColumns = 12;

static char goToText[16] = "";
static bool isGoToTextInvalid = false;
static bool shouldFocusGoToField = false;

void DrawGoToMenu(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                  ImVec2 anchor, ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize, float scale) {
    bool isOpen = BeginPanelMenu("goto", anchor, panelPosition, panelSize, displaySize, scale);
    if (isOpen) {
        float spacing = ImGui::GetStyle().ItemSpacing.x;
        if (ImGui::IsWindowAppearing()) {
            goToText[0] = '\0';
            isGoToTextInvalid = false;
            shouldFocusGoToField = true;
        }

        ImGui::TextDisabled("TIME OR TICK");
        const char* submitLabel = "GO";
        ImGui::SetNextItemWidth(ImGui::GetContentRegionAvail().x - GetButtonWidth(submitLabel) - spacing);
        if (shouldFocusGoToField) {
            ImGui::SetKeyboardFocusHere();
            shouldFocusGoToField = false;
        }
        ImGuiInputTextFlags flags = ImGuiInputTextFlags_EnterReturnsTrue | ImGuiInputTextFlags_CallbackCharFilter;
        bool isSubmitted = ImGui::InputTextWithHint("##goto", "12:34 or a tick", goToText, sizeof(goToText), flags,
                                                    &FilterGoToCharacter);
        if (ImGui::IsItemEdited()) {
            isGoToTextInvalid = false;
        }
        // The field lets go of the keyboard on Escape but the menu stays open without this.
        bool isCanceled = ImGui::IsItemDeactivated() && ImGui::IsKeyPressed(ImGuiKey_Escape, false);
        ImGui::SameLine();
        if (ImGui::Button(submitLabel)) {
            isSubmitted = true;
        }

        if (isSubmitted) {
            int tick = ParseGoToTick(goToText);
            if (tick < 0) {
                isGoToTextInvalid = true;
                // Enter left the field, the user is likely to fix what they typed.
                shouldFocusGoToField = true;
            } else {
                if (state.totalTicks > 0 && tick > state.totalTicks) {
                    tick = state.totalTicks;
                }
                AddSeekAction(actions, tick);
                ImGui::CloseCurrentPopup();
            }
        }
        if (isGoToTextInvalid) {
            ImGui::PushStyleColor(ImGuiCol_Text, overlayErrorTextColor.ToVec4());
            ImGui::TextUnformatted("Type a time as minutes:seconds or a tick");
            ImGui::PopStyleColor();
        }

        ImGui::Spacing();
        ImGui::Separator();
        ImGui::Spacing();
        ImGui::TextDisabled("ROUNDS");

        int roundCount = (int)timeline.rounds.size();
        if (roundCount == 0) {
            ImGui::TextDisabled("Analyze the demo in CS:DM to list its rounds");
        }

        // Every cell is as wide as the widest number, for the grid to line up.
        char widestLabel[12];
        snprintf(widestLabel, sizeof(widestLabel), "%d", roundCount);
        float cellHeight = 28.f * scale;
        ImVec2 cellSize = ImVec2(std::max(cellHeight, GetButtonWidth(widestLabel)), cellHeight);
        float rounding = ImGui::GetStyle().FrameRounding;
        float winnerStripHeight = 3.f * scale;
        int currentRound = RoundAtTick(timeline, state.tick);
        for (int i = 0; i < roundCount; i++) {
            const TimelineRound& round = timeline.rounds[i];
            char label[12];
            snprintf(label, sizeof(label), "%d", i + 1);
            if (i % goToRoundColumns != 0) {
                ImGui::SameLine();
            }
            if (ToggleButton(label, i + 1 == currentRound, cellSize)) {
                AddSeekAction(actions, round.startTick);
                ImGui::CloseCurrentPopup();
            }

            // The winner's color along the bottom, like on the timelines.
            if (round.winnerTeam != 0) {
                ImVec2 max = ImGui::GetItemRectMax();
                ImGui::GetWindowDrawList()->AddRectFilled(
                    ImVec2(ImGui::GetItemRectMin().x, max.y - winnerStripHeight), max,
                    WithAlpha(GetTeamColor(round.winnerTeam), roundWinnerStripAlpha), rounding,
                    ImDrawFlags_RoundCornersBottom);
            }

            if (ImGui::IsItemHovered()) {
                DrawRoundTooltip(round, i + 1, round.startTick);
            }
        }

        if (isCanceled) {
            ImGui::CloseCurrentPopup();
        }
    }
    EndPanelMenu(isOpen);
}
