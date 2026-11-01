#include "buttons_panel.h"

#include <cstdio>

#include "maths.h"
#include "overlay_palette.h"

// InputBitMask_t values copied rather than included from in_buttons.h because this file is also built into the Vulkan
// layer, which doesn't depend on the SDK (in_buttons.h pulls tier0/platform.h).
constexpr uint64_t BUTTON_ATTACK = 0x1;
constexpr uint64_t BUTTON_ATTACK2 = 0x800;
constexpr uint64_t BUTTON_JUMP = 0x2;
constexpr uint64_t BUTTON_DUCK = 0x4;
constexpr uint64_t BUTTON_FORWARD = 0x8;
constexpr uint64_t BUTTON_BACK = 0x10;
constexpr uint64_t BUTTON_USE = 0x20;
constexpr uint64_t BUTTON_MOVE_LEFT = 0x200;
constexpr uint64_t BUTTON_MOVE_RIGHT = 0x400;
constexpr uint64_t BUTTON_RELOAD = 0x2000;
constexpr uint64_t BUTTON_SPEED = 0x10000;
constexpr uint64_t BUTTON_LOOK_AT_WEAPON = 0x800000000;

constexpr ImU32 pressedColor = overlayActiveColor.ToU32();
constexpr ImU32 releasedColor = overlayIdleColor.ToU32();
constexpr ImU32 pressedBorderColor = overlayActiveBorderColor.ToU32();
constexpr ImU32 releasedBorderColor = overlayIdleBorderColor.ToU32();
constexpr ImU32 textColor = overlayTextColor.ToU32();

static void DrawKey(ImDrawList* drawList, ImVec2 position, ImVec2 size, const char* label, bool isPressed,
                    float scale) {
    ImVec2 end = ImVec2(position.x + size.x, position.y + size.y);
    float rounding = 4.f * scale;
    drawList->AddRectFilled(position, end, isPressed ? pressedColor : releasedColor, rounding);
    drawList->AddRect(position, end, isPressed ? pressedBorderColor : releasedBorderColor, rounding, 0, 2.f * scale);

    float fontSize = ImGui::GetFontSize() * scale;
    ImVec2 textSize = ImGui::GetFont()->CalcTextSizeA(fontSize, FLT_MAX, 0.f, label);
    ImVec2 textPosition = ImVec2(position.x + (size.x - textSize.x) * 0.5f, position.y + (size.y - textSize.y) * 0.5f);
    drawList->AddText(ImGui::GetFont(), fontSize, textPosition, textColor, label);
}

// Only the upper part of a mouse seen from above: the two buttons, rounded on top like the front of the shell and
// left open at the bottom, with the wheel between them.
static void DrawMouse(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isLeftPressed, bool isRightPressed,
                      float scale) {
    ImVec2 end = ImVec2(position.x + size.x, position.y + size.y);
    float rounding = size.x * 0.42f;
    float gap = 3.f * scale;
    float middle = position.x + size.x * 0.5f;

    drawList->AddRectFilled(position, ImVec2(middle - gap * 0.5f, end.y), isLeftPressed ? pressedColor : releasedColor,
                            rounding, ImDrawFlags_RoundCornersTopLeft);
    drawList->AddRectFilled(ImVec2(middle + gap * 0.5f, position.y), end, isRightPressed ? pressedColor : releasedColor,
                            rounding, ImDrawFlags_RoundCornersTopRight);

    // Wheel, drawn for shape only, no button of the mask maps to it.
    float wheelWidth = 5.f * scale;
    drawList->AddRectFilled(ImVec2(middle - wheelWidth * 0.5f, position.y + size.y * 0.22f),
                            ImVec2(middle + wheelWidth * 0.5f, position.y + size.y * 0.72f),
                            IM_COL32(110, 110, 110, 220), wheelWidth * 0.5f);

    drawList->AddRect(position, end, (isLeftPressed || isRightPressed) ? pressedBorderColor : releasedBorderColor,
                      rounding, ImDrawFlags_RoundCornersTop, 2.f * scale);
}

static void DrawSpeed(ImDrawList* drawList, ImVec2 position, ImVec2 size, float speed, float scale) {
    char value[16];
    snprintf(value, sizeof(value), "%d", (int)(speed + 0.5f));
    const char* unit = " u/s";

    ImFont* font = ImGui::GetFont();
    float valueFontSize = ImGui::GetFontSize() * scale * 1.4f;
    float unitFontSize = ImGui::GetFontSize() * scale;
    ImVec2 valueSize = font->CalcTextSizeA(valueFontSize, FLT_MAX, 0.f, value);
    ImVec2 unitSize = font->CalcTextSizeA(unitFontSize, FLT_MAX, 0.f, unit);

    float valueLeft = position.x + (size.x - valueSize.x - unitSize.x) * 0.5f;
    float valueTop = position.y + (size.y - valueSize.y) * 0.5f;
    drawList->AddText(font, valueFontSize, ImVec2(valueLeft, valueTop), textColor, value);
    drawList->AddText(font, unitFontSize, ImVec2(valueLeft + valueSize.x, valueTop + valueSize.y - unitSize.y),
                      overlayMutedTextColor.ToU32(), unit);
}

ButtonsPanelLayout DrawButtonsPanel(const ButtonsPanelState& state, ImVec2 displaySize) {
    ButtonsPanelLayout layout = {};
    if (displaySize.x <= 0.f || displaySize.y <= 0.f) {
        return layout;
    }

    ImDrawList* drawList = ImGui::GetForegroundDrawList();

    // Keep the same proportions whatever the resolution is, 1080p being the reference, times the factor the user set.
    float scale = displaySize.y / 1080.f * state.scale;
    float keySize = 46.f * scale;
    float spacing = 6.f * scale;
    float padding = 12.f * scale;
    float wideKeyWidth = keySize * 2.4f;

    float keyboardWidth = wideKeyWidth + spacing + keySize * 3 + spacing * 2;
    float mouseWidth = keySize * 1.7f;
    float contentWidth = keyboardWidth + spacing * 3 + mouseWidth;
    float speedHeight = keySize * 0.7f;
    float contentHeight = keySize * 3 + spacing * 3 + speedHeight;
    ImVec2 panelSize = ImVec2(contentWidth + padding * 2, contentHeight + padding * 2);

    ImVec2 panelPosition =
        ImVec2(state.fractionX * displaySize.x - panelSize.x, state.fractionY * displaySize.y - panelSize.y * 0.5f);
    panelPosition.x = ClampToRange(panelPosition.x, 0.f, displaySize.x - panelSize.x);
    panelPosition.y = ClampToRange(panelPosition.y, 0.f, displaySize.y - panelSize.y);

    ImVec2 panelEnd = ImVec2(panelPosition.x + panelSize.x, panelPosition.y + panelSize.y);
    drawList->AddRectFilled(
        panelPosition, panelEnd,
        ImGui::ColorConvertFloat4ToU32(ToBackgroundColor(overlayPanelBackgroundColor, state.backgroundOpacity)),
        8.f * scale);
    drawList->AddRect(panelPosition, panelEnd,
                      state.isHighlighted ? overlayHighlightedBorderColor.ToU32() : overlayBorderColor.ToU32(),
                      8.f * scale, 0, 2.f * scale);

    float left = panelPosition.x + padding;
    float top = panelPosition.y + padding;
    float movementLeft = left + wideKeyWidth + spacing;
    float bottomTop = top + (keySize + spacing) * 2;

    // Inspect, Walk and Duck stacked on the left, WASD on the right with Reload and Use under it, like a keyboard
    // viewer: Shift sits above Ctrl and Ctrl is the bottom-left key.
    DrawKey(drawList, ImVec2(left, top), ImVec2(wideKeyWidth, keySize), "INSPECT",
            (state.buttons & BUTTON_LOOK_AT_WEAPON) != 0, scale);
    DrawKey(drawList, ImVec2(left, top + keySize + spacing), ImVec2(wideKeyWidth, keySize), "WALK",
            (state.buttons & BUTTON_SPEED) != 0, scale);
    DrawKey(drawList, ImVec2(left, bottomTop), ImVec2(wideKeyWidth, keySize), "DUCK",
            (state.buttons & BUTTON_DUCK) != 0, scale);

    float movementWidth = keySize * 3 + spacing * 2;
    float bottomKeyWidth = (movementWidth - spacing) * 0.5f;
    DrawKey(drawList, ImVec2(movementLeft, bottomTop), ImVec2(bottomKeyWidth, keySize), "RELOAD",
            (state.buttons & BUTTON_RELOAD) != 0, scale);
    DrawKey(drawList, ImVec2(movementLeft + bottomKeyWidth + spacing, bottomTop), ImVec2(bottomKeyWidth, keySize),
            "USE", (state.buttons & BUTTON_USE) != 0, scale);

    DrawKey(drawList, ImVec2(movementLeft + keySize + spacing, top), ImVec2(keySize, keySize), "W",
            (state.buttons & BUTTON_FORWARD) != 0, scale);
    DrawKey(drawList, ImVec2(movementLeft, top + keySize + spacing), ImVec2(keySize, keySize), "A",
            (state.buttons & BUTTON_MOVE_LEFT) != 0, scale);
    DrawKey(drawList, ImVec2(movementLeft + keySize + spacing, top + keySize + spacing), ImVec2(keySize, keySize), "S",
            (state.buttons & BUTTON_BACK) != 0, scale);
    DrawKey(drawList, ImVec2(movementLeft + (keySize + spacing) * 2, top + keySize + spacing), ImVec2(keySize, keySize),
            "D", (state.buttons & BUTTON_MOVE_RIGHT) != 0, scale);

    // The mouse takes the first two rows of its column, the jump key sits under it on the last row.
    float mouseLeft = left + keyboardWidth + spacing * 3;
    DrawMouse(drawList, ImVec2(mouseLeft, top), ImVec2(mouseWidth, keySize * 2 + spacing),
              (state.buttons & BUTTON_ATTACK) != 0, (state.buttons & BUTTON_ATTACK2) != 0, scale);
    DrawKey(drawList, ImVec2(mouseLeft, bottomTop), ImVec2(mouseWidth, keySize), "JUMP",
            (state.buttons & BUTTON_JUMP) != 0, scale);

    DrawSpeed(drawList, ImVec2(left, bottomTop + keySize + spacing), ImVec2(contentWidth, speedHeight), state.speed,
              scale);

    layout.position = panelPosition;
    layout.size = panelSize;

    return layout;
}
