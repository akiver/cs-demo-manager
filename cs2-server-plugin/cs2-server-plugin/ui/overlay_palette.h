#pragma once

#include "imgui.h"

struct OverlayColor {
    int red;
    int green;
    int blue;
    int alpha;

    constexpr ImVec4 ToVec4() const { return ImVec4(red / 255.f, green / 255.f, blue / 255.f, alpha / 255.f); }

    constexpr ImU32 ToU32() const { return IM_COL32(red, green, blue, alpha); }
};

constexpr OverlayColor overlayPanelBackgroundColor = {20, 20, 20, 160};
constexpr OverlayColor overlayMenuBackgroundColor = {20, 20, 20, 220};
constexpr OverlayColor overlayBorderColor = {120, 160, 220, 200};
constexpr OverlayColor overlayHighlightedBorderColor = {160, 200, 255, 255};
constexpr OverlayColor overlayIdleColor = {40, 40, 40, 200};
constexpr OverlayColor overlayIdleBorderColor = {90, 90, 90, 220};
constexpr OverlayColor overlayHoveredColor = {70, 70, 70, 220};
constexpr OverlayColor overlayPressedColor = {100, 100, 100, 240};
constexpr OverlayColor overlayActiveColor = {76, 175, 80, 230};
constexpr OverlayColor overlayActiveBorderColor = {140, 220, 140, 255};
constexpr OverlayColor overlayActiveHoveredColor = {96, 195, 100, 240};
constexpr OverlayColor overlayTextColor = {255, 255, 255, 255};
constexpr OverlayColor overlayMutedTextColor = {180, 180, 180, 255};
constexpr OverlayColor overlayErrorTextColor = {240, 80, 80, 255};
constexpr OverlayColor overlayCounterTerroristColor = {93, 160, 255, 255};
constexpr OverlayColor overlayTerroristColor = {255, 170, 60, 255};
constexpr OverlayColor overlayOtherTeamColor = {200, 200, 200, 255};

// A background color at the overlays' background opacity, from 0 to 1. The panels' background takes that opacity and
// the others keep their alpha in proportion to it, so the menus stay more opaque than the panels.
inline ImVec4 ToBackgroundColor(OverlayColor color, float opacity) {
    ImVec4 result = color.ToVec4();
    float alpha = opacity * (float)color.alpha / (float)overlayPanelBackgroundColor.alpha;
    result.w = alpha < 0.f ? 0.f : (alpha > 1.f ? 1.f : alpha);

    return result;
}
