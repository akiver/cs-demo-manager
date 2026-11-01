#include "voice_indicator_panel.h"

#include <atomic>

#include "imgui.h"
#include "maths.h"
#include "overlay_palette.h"

constexpr float mutedAlpha = 0.45f;

// The panel is placed by its left middle point, as a fraction of the display size, so it keeps its relative place when
// the resolution changes and grows around its middle as players start and stop talking. The first draw goes through a
// request for the default place.
static std::atomic<bool> hasRequestedPlacement{true};
static std::atomic<float> requestedFractionX{voiceIndicatorDefaultFractionX};
static std::atomic<float> requestedFractionY{voiceIndicatorDefaultFractionY};
static std::atomic<float> drawnFractionX{voiceIndicatorDefaultFractionX};
static std::atomic<float> drawnFractionY{voiceIndicatorDefaultFractionY};

// Last drawn state, only touched by the render thread (ImGui keeps the top left corner in pixels).
static ImVec2 lastDisplaySize;
static ImVec2 lastPanelPosition;
static ImVec2 lastPanelSize;
static float lastScale = overlayDefaultScale;
// Where to move the panel's left middle point, as fractions of the display size, while repositionFramesLeft > 0.
static ImVec2 repositionFraction;
static int repositionFramesLeft = 0;
static bool isRepositioningThisFrame = false;
// The request being applied, over as many frames as the panel takes to settle on its size.
static bool isApplyingRequest = false;
static ImVec2 appliedFraction;

static ImVec4 PlayerColor(const VoiceIndicatorPlayer& player) {
    ImVec4 color = player.team == playbackTeamCT ? overlayCounterTerroristColor.ToVec4()
                                                 : (player.team == playbackTeamT ? overlayTerroristColor.ToVec4()
                                                                                 : overlayOtherTeamColor.ToVec4());
    if (player.isMuted) {
        color.w *= mutedAlpha;
    }

    return color;
}

// A microphone: a capsule, the arc of the cradle under it and the stand.
static void DrawMicrophone(ImDrawList* drawList, ImVec2 position, float size, ImU32 color) {
    float thickness = size * 0.1f;
    ImVec2 capsuleMin = ImVec2(position.x + size * 0.34f, position.y + size * 0.05f);
    ImVec2 capsuleMax = ImVec2(position.x + size * 0.66f, position.y + size * 0.55f);
    drawList->AddRectFilled(capsuleMin, capsuleMax, color, size * 0.16f);

    drawList->PathArcTo(ImVec2(position.x + size * 0.5f, position.y + size * 0.45f), size * 0.32f, 0.f, 3.14159f, 12);
    drawList->PathStroke(color, 0, thickness);

    drawList->AddLine(ImVec2(position.x + size * 0.5f, position.y + size * 0.77f),
                      ImVec2(position.x + size * 0.5f, position.y + size * 0.92f), color, thickness);
    drawList->AddLine(ImVec2(position.x + size * 0.32f, position.y + size * 0.92f),
                      ImVec2(position.x + size * 0.68f, position.y + size * 0.92f), color, thickness);
}

static ImVec2 LeftMiddleFraction(ImVec2 position, ImVec2 size, ImVec2 displaySize) {
    return ImVec2(position.x / displaySize.x, (position.y + size.y * 0.5f) / displaySize.y);
}

// Decides where ImGui puts the window this frame.
static void PlacePanel(ImVec2 displaySize, float userScale) {
    // Keep the same relative place when the display or the scale changes.
    bool displayChanged = displaySize.x != lastDisplaySize.x || displaySize.y != lastDisplaySize.y;
    if (lastDisplaySize.x > 0.f && lastPanelSize.x > 0.f && (displayChanged || userScale != lastScale)) {
        repositionFraction = LeftMiddleFraction(lastPanelPosition, lastPanelSize, lastDisplaySize);
        repositionFramesLeft = 1;
    }
    lastDisplaySize = displaySize;
    lastScale = userScale;

    // A placement requested with MoveVoiceIndicatorPanelTo takes precedence. The request is only cleared once the
    // panel has been drawn there, so GetVoiceIndicatorPanelPlacement never answers with the old place in between.
    if (hasRequestedPlacement && !isApplyingRequest) {
        isApplyingRequest = true;
        appliedFraction = ImVec2(requestedFractionX, requestedFractionY);
        repositionFraction = appliedFraction;
        repositionFramesLeft = 1;
    }

    isRepositioningThisFrame = repositionFramesLeft > 0;
    if (!isRepositioningThisFrame) {
        return;
    }
    repositionFramesLeft--;

    // The top left corner is computed here from the last known size, with no ImGui pivot: with a pivot ImGui defers
    // the placement of a window it is still measuring, and the position read back would be meaningless. The size of
    // a new window is only right after a frame or two, PublishPanelPlacement places it again until it settles.
    ImVec2 position =
        ImVec2(repositionFraction.x * displaySize.x, repositionFraction.y * displaySize.y - lastPanelSize.y * 0.5f);
    if (lastPanelSize.x > 0.f) {
        position.x = ClampToRange(position.x, 0.f, displaySize.x - lastPanelSize.x);
        position.y = ClampToRange(position.y, 0.f, displaySize.y - lastPanelSize.y);
    }
    ImGui::SetNextWindowPos(position, ImGuiCond_Always);
}

static void PublishDrawnPlacement(ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize) {
    ImVec2 fraction = LeftMiddleFraction(panelPosition, panelSize, displaySize);
    drawnFractionX = fraction.x;
    drawnFractionY = fraction.y;
}

// Records where the panel was drawn and finishes the pending moves, once the panel's size has settled.
static void PublishPanelPlacement(ImVec2 panelPosition, ImVec2 panelSize, ImVec2 displaySize) {
    bool sizeChanged = panelSize.x != lastPanelSize.x || panelSize.y != lastPanelSize.y;
    if (isRepositioningThisFrame) {
        if (sizeChanged) {
            // The target was computed with the old size, place the panel again with this one.
            repositionFramesLeft = 1;
        } else {
            PublishDrawnPlacement(panelPosition, panelSize, displaySize);
            if (isApplyingRequest) {
                isApplyingRequest = false;
                // Unless a newer request came in the meantime, which is applied on the next frame.
                if (requestedFractionX == appliedFraction.x && requestedFractionY == appliedFraction.y) {
                    hasRequestedPlacement = false;
                }
            }
        }
    } else if (sizeChanged && lastPanelSize.y > 0.f && panelPosition.x == lastPanelPosition.x &&
               panelPosition.y == lastPanelPosition.y) {
        // Players started or stopped talking and ImGui kept the top left corner: move the panel on the next frame so
        // its middle stays where it was.
        repositionFraction = ImVec2(drawnFractionX, drawnFractionY);
        repositionFramesLeft = 1;
    } else {
        PublishDrawnPlacement(panelPosition, panelSize, displaySize);
    }
    lastPanelPosition = panelPosition;
    lastPanelSize = panelSize;
}

void DrawVoiceIndicatorPanel(const VoiceIndicatorState& state, float backgroundOpacity, float userScale) {
    int playerCount = state.playerCount < 0 ? 0
                                            : (state.playerCount > voiceIndicatorMaxPlayers ? voiceIndicatorMaxPlayers
                                                                                            : state.playerCount);
    ImVec2 displaySize = ImGui::GetIO().DisplaySize;
    if (playerCount == 0 || displaySize.x <= 0.f || displaySize.y <= 0.f) {
        return;
    }

    // Keep the same proportions whatever the resolution is, 1080p being the reference, times the factor the user set.
    float scale = displaySize.y / 1080.f * userScale;
    float fontScale = 1.6f;
    ImGuiStyle& style = ImGui::GetStyle();
    ImGui::PushFont(NULL, style.FontSizeBase * scale * fontScale);
    float fontSize = ImGui::GetFontSize();
    float spacing = 6.f * scale;

    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, ImVec2(10.f * scale, 8.f * scale));
    ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, 8.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 2.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_ItemSpacing, ImVec2(spacing, 4.f * scale));
    ImGui::PushStyleColor(ImGuiCol_WindowBg, ToBackgroundColor(overlayPanelBackgroundColor, backgroundOpacity));
    ImGui::PushStyleColor(ImGuiCol_Border, overlayBorderColor.ToVec4());

    PlacePanel(displaySize, userScale);
    // The window stays movable: ImGui moves it when its background is dragged.
    ImGuiWindowFlags flags = ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoScrollbar |
                             ImGuiWindowFlags_NoScrollWithMouse | ImGuiWindowFlags_NoCollapse |
                             ImGuiWindowFlags_AlwaysAutoResize | ImGuiWindowFlags_NoSavedSettings |
                             ImGuiWindowFlags_NoNav | ImGuiWindowFlags_NoFocusOnAppearing;
    bool isDrawn = ImGui::Begin("csdm_voice_indicator", NULL, flags);
    if (isDrawn) {
        PublishPanelPlacement(ImGui::GetWindowPos(), ImGui::GetWindowSize(), displaySize);

        ImDrawList* drawList = ImGui::GetWindowDrawList();
        for (int i = 0; i < playerCount; i++) {
            const VoiceIndicatorPlayer& player = state.players[i];
            ImVec4 color = PlayerColor(player);
            DrawMicrophone(drawList, ImGui::GetCursorScreenPos(), fontSize, ImGui::GetColorU32(color));
            ImGui::Dummy(ImVec2(fontSize, fontSize));
            ImGui::SameLine();
            ImGui::TextColored(color, "%s", player.name);
        }
    } else if (isRepositioningThisFrame) {
        // ImGui skipped the window, so where it landed is unknown: place it again.
        repositionFramesLeft = 1;
    }
    ImGui::End();

    ImGui::PopStyleColor(2);
    ImGui::PopStyleVar(4);
    ImGui::PopFont();
}

void MoveVoiceIndicatorPanelTo(float fractionX, float fractionY) {
    requestedFractionX = ClampToRange(fractionX, 0.f, 1.f);
    requestedFractionY = ClampToRange(fractionY, 0.f, 1.f);
    hasRequestedPlacement = true;
}

void GetVoiceIndicatorPanelPlacement(float* fractionX, float* fractionY) {
    if (hasRequestedPlacement) {
        *fractionX = requestedFractionX;
        *fractionY = requestedFractionY;

        return;
    }

    *fractionX = drawnFractionX;
    *fractionY = drawnFractionY;
}
