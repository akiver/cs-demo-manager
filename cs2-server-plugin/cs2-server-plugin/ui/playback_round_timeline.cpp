#include "playback_round_timeline.h"

#include <algorithm>
#include <cfloat>
#include <cmath>
#include <cstdio>

#include "imgui.h"
#include "maths.h"
#include "overlay_palette.h"
#include "playback_icons.h"
#include "playback_state.h"
#include "playback_widgets.h"

static bool isSeekingInRound = false;
static float roundSeekFraction = 0.f;

static void DrawKillSkipButton(const char* id, const PlaybackPanelState& state, const PlaybackTimeline& timeline,
                               bool isNext, ImVec2 size, PlaybackPanelActions& actions) {
    const TimelineKill* targetKill = FindKillToSeekTo(timeline, state.tick, state.spectatedSteamId, isNext);
    bool hasTarget = targetKill != NULL;
    if (SkipButton(id, size, hasTarget)) {
        AddKillSeekAction(actions, *targetKill);
    }
    DrawKillSkipIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isNext,
                     GetSkipIconColor(hasTarget));

    if (ImGui::IsItemHovered()) {
        const char* direction = isNext ? "Next" : "Previous";
        const char* name = GetSpectatedPlayerName(state);
        if (name != NULL) {
            SetPanelTooltip(state, "%s kill of %s", direction, name);
        } else if (state.spectatedSteamId != 0) {
            SetPanelTooltip(state, "%s kill of the spectated player", direction);
        } else {
            SetPanelTooltip(state, "%s kill", direction);
        }
    }
}

static void DrawSequenceTooltipLine(const char* label, const char* noneLabel, const TimelineSequence* sequence,
                                    bool isLowlight) {
    if (sequence == NULL) {
        ImGui::TextDisabled("%s", noneLabel);
        return;
    }

    ImGui::TextUnformatted(label);
    ImGui::SameLine();
    ImGui::TextColored(ImGui::ColorConvertU32ToFloat4(GetTeamColor(sequence->team)), "%s",
                       sequence->playerName[0] != '\0' ? sequence->playerName : "a bot");
    ImGui::SameLine();
    char time[tickTimeTextSize];
    FormatTickTime(time, sizeof(time), sequence->startTick);
    ImGui::TextDisabled("%d %s%s  %s", sequence->eventCount, isLowlight ? "death" : "kill",
                        sequence->eventCount == 1 ? "" : "s", time);
}

// Left click goes to the next/previous highlight, right click to the next/previous lowlight. With the round timeline
// set to the spectated player only, only their highlights count, everyone's otherwise. The player of the highlight is
// spectated once the seek lands.
static void DrawHighlightSkipButton(const char* id, const PlaybackPanelState& state, const PlaybackTimeline& timeline,
                                    bool isNext, ImVec2 size, PlaybackPanelActions& actions) {
    uint64_t steamId = GetSequenceFilterSteamId(state);
    const TimelineSequence* highlight = FindSequenceToSeekTo(timeline.highlights, state.tick, steamId, isNext);
    const TimelineSequence* lowlight = FindSequenceToSeekTo(timeline.lowlights, state.tick, steamId, isNext);
    bool hasHighlight = highlight != NULL;
    if (SkipButton(id, size, hasHighlight)) {
        AddSequenceSeekAction(actions, *highlight);
    }
    // The button is dimmed without a highlight, but the lowlights stay a right click away.
    if (lowlight != NULL && ImGui::IsItemClicked(ImGuiMouseButton_Right)) {
        AddSequenceSeekAction(actions, *lowlight);
    }
    DrawHighlightSkipIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isNext,
                          GetSkipIconColor(hasHighlight));

    if (ImGui::IsItemHovered() && state.areTooltipsEnabled) {
        ImGui::BeginTooltip();
        DrawSequenceTooltipLine(isNext ? "Next highlight" : "Previous highlight",
                                isNext ? "No next highlight" : "No previous highlight", highlight, false);
        DrawSequenceTooltipLine(isNext ? "Right click: next lowlight" : "Right click: previous lowlight",
                                isNext ? "No next lowlight" : "No previous lowlight", lowlight, true);
        ImGui::EndTooltip();
    }
}

static void DrawRoundSkipButton(const char* id, const PlaybackPanelState& state, const PlaybackTimeline& timeline,
                                int targetRound, bool isNext, ImVec2 size, PlaybackPanelActions& actions) {
    bool hasTarget = targetRound >= 1 && targetRound <= (int)timeline.rounds.size();
    if (SkipButton(id, size, hasTarget)) {
        AddSeekAction(actions, timeline.rounds[targetRound - 1].startTick);
    }
    DrawSkipIcon(ImGui::GetWindowDrawList(), ImGui::GetItemRectMin(), ImGui::GetItemRectSize(), isNext,
                 GetSkipIconColor(hasTarget));

    if (ImGui::IsItemHovered()) {
        if (hasTarget) {
            SetPanelTooltip(state, isNext ? "Next round" : "Previous round");
        } else {
            SetPanelTooltip(state, isNext ? "No next round" : "No previous round");
        }
    }
}

// Laid out like the game's kill feed, the killer, the weapon and the victim, with the details underneath.
static void DrawKillTooltip(const TimelineKill& kill) {
    ImGui::BeginTooltip();
    ImGui::TextColored(ImGui::ColorConvertU32ToFloat4(GetTeamColor(kill.killerTeam)), "%s", kill.killerName);
    ImGui::SameLine();
    ImGui::TextUnformatted(kill.weaponName[0] != '\0' ? kill.weaponName : ">");
    ImGui::SameLine();
    ImGui::TextColored(ImGui::ColorConvertU32ToFloat4(GetTeamColor(kill.victimTeam)), "%s", kill.victimName);

    const char* details = kill.isHeadshot && kill.isWallbang ? "Headshot, wallbang  "
                          : kill.isHeadshot                  ? "Headshot  "
                          : kill.isWallbang                  ? "Wallbang  "
                                                             : "";
    char time[tickTimeTextSize];
    FormatTickTime(time, sizeof(time), kill.tick);
    ImGui::TextDisabled("%s%s", details, time);
    ImGui::EndTooltip();
}

void DrawRoundTimeline(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                       float width, float scale) {
    int round;
    int startTick;
    int endTick;
    if (!GetCurrentRoundSpan(state, timeline, &round, &startTick, &endTick)) {
        return;
    }

    float rowHeight = 22.f * scale;
    ImVec2 buttonSize = ImVec2(rowHeight, rowHeight);
    float spacing = ImGui::GetStyle().ItemSpacing.x;
    float rowWidth = width - (buttonSize.x + spacing) * 6.f;

    DrawRoundSkipButton("##previousRound", state, timeline, round - 1, false, buttonSize, actions);
    ImGui::SameLine();
    DrawHighlightSkipButton("##previousHighlight", state, timeline, false, buttonSize, actions);
    ImGui::SameLine();
    DrawKillSkipButton("##previousKill", state, timeline, false, buttonSize, actions);
    ImGui::SameLine();
    ImVec2 rowPosition = ImGui::GetCursorScreenPos();
    ImGui::InvisibleButton("##round", ImVec2(rowWidth, rowHeight));

    bool isActive = ImGui::IsItemActive();
    bool isHovered = ImGui::IsItemHovered();
    bool isReleased = ImGui::IsItemDeactivated();
    ImGui::SameLine();
    DrawKillSkipButton("##nextKill", state, timeline, true, buttonSize, actions);
    ImGui::SameLine();
    DrawHighlightSkipButton("##nextHighlight", state, timeline, true, buttonSize, actions);
    ImGui::SameLine();
    DrawRoundSkipButton("##nextRound", state, timeline, round + 1, true, buttonSize, actions);
    // The row is drawn over the invisible button laid out above.
    width = rowWidth;

    float mouseFraction = ClampToRange((ImGui::GetIO().MousePos.x - rowPosition.x) / width, 0.f, 1.f);
    float spanTicks = (float)(endTick - startTick);
    if (isActive) {
        isSeekingInRound = true;
        roundSeekFraction = mouseFraction;
    }

    float left = rowPosition.x;
    float top = rowPosition.y;
    float bottom = top + rowHeight;
    ImDrawList* drawList = ImGui::GetWindowDrawList();
    ImFont* font = ImGui::GetFont();
    float labelFontSize = ImGui::GetFontSize() * 0.8f;
    float rounding = 3.f * scale;
    drawList->AddRectFilled(ImVec2(left, top), ImVec2(left + width, bottom), roundBandAlternateColor, rounding);

    // The freeze time and the time after the round is won are darkened, the clock doesn't run then, and the time the
    // bomb ticks is tinted red.
    if (round > 0) {
        RoundPhases phases = GetRoundPhases(timeline, round);
        float freezeTimeEndX =
            left + width * ClampToRange((float)(phases.freezeTimeEndTick - startTick) / spanTicks, 0.f, 1.f);
        if (freezeTimeEndX > left) {
            drawList->AddRectFilled(ImVec2(left, top), ImVec2(freezeTimeEndX, bottom), roundStoppedClockBandColor,
                                    rounding, ImDrawFlags_RoundCornersLeft);
        }
        float roundEndX = left + width * ClampToRange((float)(phases.endTick - startTick) / spanTicks, 0.f, 1.f);
        if (roundEndX < left + width) {
            drawList->AddRectFilled(ImVec2(roundEndX, top), ImVec2(left + width, bottom), roundStoppedClockBandColor,
                                    rounding, ImDrawFlags_RoundCornersRight);
        }
        if (phases.bombPlantTick >= 0) {
            float plantX = left + width * ClampToRange((float)(phases.bombPlantTick - startTick) / spanTicks, 0.f, 1.f);
            float bombEndX = left + width * ClampToRange((float)(phases.bombEndTick - startTick) / spanTicks, 0.f, 1.f);
            drawList->AddRectFilled(ImVec2(plantX, top), ImVec2(bombEndX, bottom), bombWindowBandColor);
        }
    }

    // The part of the possible loop that falls in the round.
    bool hasLoopEnd = state.loopEndTick >= 0;
    bool isLoopInRound = state.loopStartTick >= 0 && state.loopStartTick < endTick &&
                         (hasLoopEnd ? state.loopEndTick > startTick : state.loopStartTick >= startTick);
    if (isLoopInRound) {
        float startX = left + width * ClampToRange((float)(state.loopStartTick - startTick) / spanTicks, 0.f, 1.f);
        float endX = hasLoopEnd
                         ? left + width * ClampToRange((float)(state.loopEndTick - startTick) / spanTicks, 0.f, 1.f)
                         : -1.f;
        DrawLoopMarks(drawList, startX, endX, state.loopStartTick >= startTick, state.loopEndTick < endTick, top,
                      bottom, scale);
    }

    // The part of the pending video sequence, from its start to the current tick, that falls in the round.
    if (state.sequenceStartTick >= 0) {
        int sequenceFrom = std::min(state.sequenceStartTick, state.tick);
        int sequenceTo = std::max(state.sequenceStartTick, state.tick);
        bool isStartInRound = state.sequenceStartTick >= startTick && state.sequenceStartTick < endTick;
        if (isStartInRound || (sequenceFrom < endTick && sequenceTo > startTick)) {
            float sequenceStartX =
                left + width * ClampToRange((float)(state.sequenceStartTick - startTick) / spanTicks, 0.f, 1.f);
            float currentX = left + width * ClampToRange((float)(state.tick - startTick) / spanTicks, 0.f, 1.f);
            DrawSequenceMarks(drawList, sequenceStartX, currentX, isStartInRound, top, bottom, scale);
        }
    }

    char roundLabel[24];
    if (round > 0) {
        snprintf(roundLabel, sizeof(roundLabel), "ROUND %d", round);
    } else {
        snprintf(roundLabel, sizeof(roundLabel), "WARMUP");
    }
    ImVec2 roundLabelSize = font->CalcTextSizeA(labelFontSize, FLT_MAX, 0.f, roundLabel);
    float labelLeft = left + 6.f * scale;
    float labelTop = top + (rowHeight - roundLabelSize.y) * 0.5f;
    drawList->AddText(font, labelFontSize, ImVec2(labelLeft, labelTop), overlayMutedTextColor.ToU32(), roundLabel);

    // The winner is a dot of its color after the round number, like the CT/T labels of the menus. A bar along the row
    // would run into the kill markers, drawn in the same colors.
    int winnerTeam = round > 0 ? timeline.rounds[round - 1].winnerTeam : 0;
    bool isWinnerDotHovered = false;
    if (winnerTeam != 0) {
        float dotRadius = labelFontSize * 0.22f;
        float dotSpacing = 5.f * scale;
        ImVec2 dotCenter = ImVec2(labelLeft + roundLabelSize.x + dotSpacing + dotRadius, top + rowHeight * 0.5f);
        drawList->AddCircleFilled(dotCenter, dotRadius, GetTeamColor(winnerTeam), 16);

        // The dot is small, so the mouse counts as over it a few pixels around.
        ImVec2 mousePosition = ImGui::GetIO().MousePos;
        float dotReach = dotRadius + 4.f * scale;
        isWinnerDotHovered = isHovered && !isActive && fabsf(mousePosition.x - dotCenter.x) <= dotReach &&
                             fabsf(mousePosition.y - dotCenter.y) <= dotReach;
    }

    float bombPlantMargin = 3.f * scale;
    float hoverReach = 5.f * scale;
    float mouseX = left + width * mouseFraction;
    const TimelineKill* hoveredKill = NULL;
    const TimelineBombPlant* hoveredBombPlant = NULL;
    const TimelineBombDefuse* hoveredBombDefuse = NULL;
    float hoveredDistance = hoverReach;
    float bombPlantHalfWidth = 2.f * scale;
    for (const TimelineBombPlant& bombPlant : timeline.bombPlants) {
        if (bombPlant.tick < startTick || bombPlant.tick >= endTick || !IsBombPlantOnRoundTimeline(state, bombPlant)) {
            continue;
        }

        float x = left + width * ((float)(bombPlant.tick - startTick) / spanTicks);
        drawList->AddRectFilled(ImVec2(x - bombPlantHalfWidth, top + bombPlantMargin),
                                ImVec2(x + bombPlantHalfWidth, bottom - bombPlantMargin), bombPlantColor);

        float distance = x > mouseX ? x - mouseX : mouseX - x;
        if ((isHovered || isActive) && distance <= hoveredDistance) {
            hoveredDistance = distance;
            hoveredBombPlant = &bombPlant;
        }
    }
    for (const TimelineBombDefuse& bombDefuse : timeline.bombDefuses) {
        if (bombDefuse.tick < startTick || bombDefuse.tick >= endTick ||
            !IsBombDefuseOnRoundTimeline(state, bombDefuse)) {
            continue;
        }

        float x = left + width * ((float)(bombDefuse.tick - startTick) / spanTicks);
        drawList->AddRectFilled(ImVec2(x - bombPlantHalfWidth, top + bombPlantMargin),
                                ImVec2(x + bombPlantHalfWidth, bottom - bombPlantMargin), bombDefuseColor);

        float distance = x > mouseX ? x - mouseX : mouseX - x;
        if ((isHovered || isActive) && distance <= hoveredDistance) {
            hoveredDistance = distance;
            hoveredBombPlant = NULL;
            hoveredBombDefuse = &bombDefuse;
        }
    }

    // Faded kills first, then the highlighted ones, larger and on top.
    float iconCenterY = top + 12.5f * scale;
    float headshotY = top + 4.f * scale;
    float wallbangY = bottom - 2.5f * scale;
    for (int pass = 0; pass < 2; pass++) {
        bool highlightedPass = pass == 1;
        float iconHalfSize = (highlightedPass ? 4.5f : 3.5f) * scale;
        float thickness = (highlightedPass ? 2.f : 1.5f) * scale;
        int alpha = highlightedPass ? 255 : otherKillAlpha;
        for (const TimelineKill& kill : timeline.kills) {
            if (kill.tick < startTick || kill.tick >= endTick || !IsKillOnRoundTimeline(state, kill) ||
                IsKillHighlighted(state, kill) != highlightedPass) {
                continue;
            }

            float x = left + width * ((float)(kill.tick - startTick) / spanTicks);
            ImU32 markColor = WithAlpha(overlayTextColor.ToU32(), alpha);
            ImVec2 iconCenter = ImVec2(x, iconCenterY);
            bool isSpectatedPlayerKill = state.spectatedSteamId != 0 && kill.killerSteamId == state.spectatedSteamId &&
                                         kill.victimSteamId != state.spectatedSteamId;
            if (isSpectatedPlayerKill) {
                DrawKillIcon(drawList, iconCenter, iconHalfSize, thickness,
                             WithAlpha(GetTeamColor(kill.killerTeam), alpha));
            } else {
                DrawDeathIcon(drawList, iconCenter, iconHalfSize, thickness,
                              WithAlpha(GetTeamColor(kill.victimTeam), alpha));
            }
            // A dot above the icon marks a headshot
            if (kill.isHeadshot) {
                drawList->AddCircleFilled(ImVec2(x, headshotY), thickness, markColor, 12);
            }
            // A dash under it a wallbang
            if (kill.isWallbang) {
                drawList->AddLine(ImVec2(x - iconHalfSize, wallbangY), ImVec2(x + iconHalfSize, wallbangY), markColor,
                                  thickness * 0.75f);
            }

            float distance = x > mouseX ? x - mouseX : mouseX - x;
            if ((isHovered || isActive) && distance <= hoveredDistance) {
                hoveredDistance = distance;
                hoveredKill = &kill;
                hoveredBombPlant = NULL;
                hoveredBombDefuse = NULL;
            }
        }
    }

    // Releasing the mouse seeks to where it is, or to the kill it was clicked on like the kill arrows do. A drag that
    // ends on a kill is a scrub, not a click.
    if (isSeekingInRound && isReleased) {
        isSeekingInRound = false;
        ImGuiIO& io = ImGui::GetIO();
        bool isClick =
            io.MouseDragMaxDistanceSqr[ImGuiMouseButton_Left] < io.MouseDragThreshold * io.MouseDragThreshold;
        if (isClick && hoveredKill != NULL) {
            AddKillSeekAction(actions, *hoveredKill);
        } else {
            AddSeekAction(actions, startTick + (int)(spanTicks * roundSeekFraction));
        }
    }

    // The playhead follows the mouse while it is dragged.
    float fraction =
        isSeekingInRound ? roundSeekFraction : ClampToRange((float)(state.tick - startTick) / spanTicks, 0.f, 1.f);
    float playedX = left + width * fraction;
    drawList->AddLine(ImVec2(playedX, top), ImVec2(playedX, bottom), overlayTextColor.ToU32(), 2.f * scale);

    if (isHovered || isActive) {
        drawList->AddLine(ImVec2(mouseX, top), ImVec2(mouseX, bottom), hoverLineColor, 1.f * scale);

        char time[tickTimeTextSize];
        if (hoveredKill != NULL) {
            DrawKillTooltip(*hoveredKill);
        } else if (hoveredBombPlant != NULL) {
            FormatTickTime(time, sizeof(time), hoveredBombPlant->tick);
            ImGui::SetTooltip("Bomb planted on %c  %s", hoveredBombPlant->site, time);
        } else if (hoveredBombDefuse != NULL) {
            FormatTickTime(time, sizeof(time), hoveredBombDefuse->tick);
            ImGui::SetTooltip("Bomb defused on %c  %s", hoveredBombDefuse->site, time);
        } else if (isWinnerDotHovered) {
            // The winner in its color, then how the round ended, like the round tooltip of the match timeline.
            const TimelineRound& timelineRound = timeline.rounds[round - 1];
            ImGui::BeginTooltip();
            ImGui::TextColored(ImGui::ColorConvertU32ToFloat4(GetTeamColor(winnerTeam)), "%s",
                               GetRoundWinnerName(timelineRound));
            ImGui::SameLine();
            ImGui::TextUnformatted("won the round");
            const char* endReasonText = GetRoundEndReasonText(timelineRound.endReason);
            if (endReasonText != NULL) {
                ImGui::TextDisabled("%s", endReasonText);
            }
            ImGui::EndTooltip();
        } else {
            FormatTickTime(time, sizeof(time), startTick + (int)(spanTicks * mouseFraction));
            ImGui::SetTooltip("%s", time);
        }
    }
}

bool IsRoundTimelineSeeking() { return isSeekingInRound; }
