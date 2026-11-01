#include "playback_match_timeline.h"

#include <cfloat>
#include <cstdio>

#include "imgui.h"
#include "maths.h"
#include "overlay_palette.h"
#include "playback_icons.h"
#include "playback_widgets.h"

static bool isSeeking = false;
static float seekFraction = 0.f;

void DrawMatchTimeline(const PlaybackPanelState& state, const PlaybackTimeline& timeline, PlaybackPanelActions& actions,
                       float width, float scale) {
    float killsRowHeight = 10.f * scale;
    float roundsRowHeight = 19.f * scale;
    float winnerStripHeight = 3.f * scale;
    float trackHeight = 8.f * scale;
    float rowSpacing = 3.f * scale;
    float stripHeight = killsRowHeight + rowSpacing + roundsRowHeight + rowSpacing + trackHeight;
    ImVec2 stripPosition = ImGui::GetCursorScreenPos();
    ImGui::InvisibleButton("##timeline", ImVec2(width, stripHeight));

    bool isActive = ImGui::IsItemActive();
    bool isHovered = ImGui::IsItemHovered();
    float mouseFraction = ClampToRange((ImGui::GetIO().MousePos.x - stripPosition.x) / width, 0.f, 1.f);
    if (isActive) {
        isSeeking = true;
        seekFraction = mouseFraction;
    } else if (isSeeking && ImGui::IsItemDeactivated()) {
        isSeeking = false;
        AddSeekAction(actions, (int)((float)state.totalTicks * seekFraction));
    }

    float totalTicks = (float)state.totalTicks;
    float left = stripPosition.x;
    float right = stripPosition.x + width;
    float killsTop = stripPosition.y;
    float roundsTop = killsTop + killsRowHeight + rowSpacing;
    float trackTop = roundsTop + roundsRowHeight + rowSpacing;
    float stripBottom = trackTop + trackHeight;
    ImDrawList* drawList = ImGui::GetWindowDrawList();
    ImFont* font = ImGui::GetFont();
    float roundFontSize = ImGui::GetFontSize() * 0.8f;

    int roundCount = (int)timeline.rounds.size();
    float winnerStripTop = roundsTop + roundsRowHeight - winnerStripHeight;
    for (int i = 0; i < roundCount; i++) {
        const TimelineRound& round = timeline.rounds[i];
        float startX = left + width * ClampToRange((float)round.startTick / totalTicks, 0.f, 1.f);
        float endX = i + 1 < roundCount
                         ? left + width * ClampToRange((float)timeline.rounds[i + 1].startTick / totalTicks, 0.f, 1.f)
                         : right;
        // Every other band is shaded, over the whole height of the strip so the kills and the track read against it.
        drawList->AddRectFilled(ImVec2(startX, killsTop), ImVec2(endX, stripBottom),
                                i % 2 == 0 ? roundBandColor : roundBandAlternateColor);
        drawList->AddLine(ImVec2(startX, killsTop), ImVec2(startX, stripBottom), roundMarkColor, 1.f * scale);

        if (round.winnerTeam != 0) {
            drawList->AddRectFilled(ImVec2(startX, winnerStripTop), ImVec2(endX, roundsTop + roundsRowHeight),
                                    WithAlpha(GetTeamColor(round.winnerTeam), roundWinnerStripAlpha));
        }

        char roundText[12];
        snprintf(roundText, sizeof(roundText), "%d", i + 1);
        ImVec2 textSize = font->CalcTextSizeA(roundFontSize, FLT_MAX, 0.f, roundText);
        if (endX - startX > textSize.x + 6.f * scale) {
            drawList->AddText(font, roundFontSize,
                              ImVec2(startX + (endX - startX - textSize.x) * 0.5f,
                                     roundsTop + (winnerStripTop - roundsTop - textSize.y) * 0.5f),
                              overlayMutedTextColor.ToU32(), roundText);
        }
    }

    if (state.loopStartTick >= 0) {
        float startX = left + width * ClampToRange((float)state.loopStartTick / totalTicks, 0.f, 1.f);
        float endX = state.loopEndTick >= 0
                         ? left + width * ClampToRange((float)state.loopEndTick / totalTicks, 0.f, 1.f)
                         : -1.f;
        DrawLoopMarks(drawList, startX, endX, true, true, killsTop, stripBottom, scale);
    }
    if (state.sequenceStartTick >= 0) {
        float startX = left + width * ClampToRange((float)state.sequenceStartTick / totalTicks, 0.f, 1.f);
        float currentX = left + width * ClampToRange((float)state.tick / totalTicks, 0.f, 1.f);
        DrawSequenceMarks(drawList, startX, currentX, true, killsTop, stripBottom, scale);
    }

    float bombPlantHalfWidth = 1.f * scale;
    for (const TimelineBombPlant& bombPlant : timeline.bombPlants) {
        float x = left + width * ClampToRange((float)bombPlant.tick / totalTicks, 0.f, 1.f);
        drawList->AddRectFilled(ImVec2(x - bombPlantHalfWidth, roundsTop),
                                ImVec2(x + bombPlantHalfWidth, winnerStripTop), bombPlantColor);
    }
    for (const TimelineBombDefuse& bombDefuse : timeline.bombDefuses) {
        float x = left + width * ClampToRange((float)bombDefuse.tick / totalTicks, 0.f, 1.f);
        drawList->AddRectFilled(ImVec2(x - bombPlantHalfWidth, roundsTop),
                                ImVec2(x + bombPlantHalfWidth, winnerStripTop), bombDefuseColor);
    }

    float killIconHalfSize = 4.5f * scale;
    float killIconThickness = 2.f * scale;
    float killIconCenterY = killsTop + killsRowHeight * 0.5f;
    for (const TimelineKill& kill : timeline.kills) {
        if (!IsKillOfPlayer(kill, state.spectatedSteamId)) {
            continue;
        }

        float x = left + width * ClampToRange((float)kill.tick / totalTicks, 0.f, 1.f);
        ImVec2 iconCenter = ImVec2(x, killIconCenterY);
        if (kill.victimSteamId == state.spectatedSteamId) {
            DrawDeathIcon(drawList, iconCenter, killIconHalfSize, killIconThickness, GetTeamColor(kill.victimTeam));
        } else {
            DrawKillIcon(drawList, iconCenter, killIconHalfSize, killIconThickness, GetTeamColor(kill.killerTeam));
        }
    }

    float fraction = isSeeking ? seekFraction : ClampToRange((float)state.tick / totalTicks, 0.f, 1.f);
    float playedX = left + width * fraction;
    float rounding = trackHeight * 0.5f;
    drawList->AddRectFilled(ImVec2(left, trackTop), ImVec2(right, stripBottom), overlayIdleColor.ToU32(), rounding);
    drawList->AddRectFilled(ImVec2(left, trackTop), ImVec2(playedX, stripBottom), overlayActiveColor.ToU32(), rounding);
    drawList->AddLine(ImVec2(playedX, killsTop), ImVec2(playedX, trackTop), overlayTextColor.ToU32(), 1.f * scale);
    drawList->AddCircleFilled(ImVec2(playedX, trackTop + trackHeight * 0.5f),
                              (isHovered || isActive ? 8.f : 6.f) * scale, overlayTextColor.ToU32());

    // Where a click would seek to: a line at the mouse and the round and time it points at.
    if (isHovered || isActive) {
        float mouseX = left + width * mouseFraction;
        drawList->AddLine(ImVec2(mouseX, killsTop), ImVec2(mouseX, stripBottom), hoverLineColor, 1.f * scale);

        // Move the tooltip above (or under) the timeline rather than under the mouse where it would hide the rest of
        // the panel.
        float tooltipGap = 6.f * scale;
        bool isTooltipBelow = killsTop < ImGui::GetIO().DisplaySize.y * 0.5f;
        ImGui::SetNextWindowPos(ImVec2(mouseX, isTooltipBelow ? stripBottom + tooltipGap : killsTop - tooltipGap),
                                ImGuiCond_Always, ImVec2(0.5f, isTooltipBelow ? 0.f : 1.f));

        int hoveredTick = (int)(totalTicks * mouseFraction);
        int round = RoundAtTick(timeline, hoveredTick);
        if (round > 0) {
            DrawRoundTooltip(timeline.rounds[round - 1], round, hoveredTick);
        } else {
            char time[tickTimeTextSize];
            FormatTickTime(time, sizeof(time), hoveredTick);
            ImGui::BeginTooltip();
            KeepTooltipInDisplay();
            ImGui::TextUnformatted(time);
            ImGui::EndTooltip();
        }
    }
}

bool IsMatchTimelineSeeking() { return isSeeking; }
