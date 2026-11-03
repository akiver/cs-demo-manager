#include "playback_icons.h"

#include <cmath>

#include "overlay_palette.h"

void DrawPlayPauseIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isPaused) {
    if (isPaused) {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.36f, position.y + size.y * 0.26f),
                                    ImVec2(position.x + size.x * 0.36f, position.y + size.y * 0.74f),
                                    ImVec2(position.x + size.x * 0.78f, position.y + size.y * 0.5f),
                                    overlayTextColor.ToU32());
    } else {
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.32f, position.y + size.y * 0.26f),
                                ImVec2(position.x + size.x * 0.45f, position.y + size.y * 0.74f),
                                overlayTextColor.ToU32());
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.55f, position.y + size.y * 0.26f),
                                ImVec2(position.x + size.x * 0.68f, position.y + size.y * 0.74f),
                                overlayTextColor.ToU32());
    }
}

void DrawStopIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size) {
    drawList->AddRectFilled(ImVec2(position.x + size.x * 0.3f, position.y + size.y * 0.3f),
                            ImVec2(position.x + size.x * 0.7f, position.y + size.y * 0.7f), overlayTextColor.ToU32(),
                            size.y * 0.06f);
}

void DrawKillIcon(ImDrawList* drawList, ImVec2 center, float halfSize, float thickness, ImU32 color) {
    drawList->AddCircle(center, halfSize - thickness * 0.5f, color, 16, thickness);
    drawList->AddCircleFilled(center, thickness * 0.8f, color, 8);
}

void DrawDeathIcon(ImDrawList* drawList, ImVec2 center, float halfSize, float thickness, ImU32 color) {
    drawList->AddLine(ImVec2(center.x - halfSize, center.y - halfSize),
                      ImVec2(center.x + halfSize, center.y + halfSize), color, thickness);
    drawList->AddLine(ImVec2(center.x + halfSize, center.y - halfSize),
                      ImVec2(center.x - halfSize, center.y + halfSize), color, thickness);
}

void DrawCameraIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size) {
    ImU32 color = ImGui::GetColorU32(ImGuiCol_Text);
    float top = position.y + size.y * 0.34f;
    float bottom = position.y + size.y * 0.66f;
    float bodyLeft = position.x + size.x * 0.24f;
    float bodyRight = position.x + size.x * 0.6f;
    drawList->AddRectFilled(ImVec2(bodyLeft, top), ImVec2(bodyRight, bottom), color, size.y * 0.04f);
    drawList->AddTriangleFilled(ImVec2(bodyRight + size.x * 0.02f, position.y + size.y * 0.5f),
                                ImVec2(position.x + size.x * 0.76f, position.y + size.y * 0.36f),
                                ImVec2(position.x + size.x * 0.76f, position.y + size.y * 0.64f), color);
}

void DrawMicrophoneIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size) {
    ImU32 color = ImGui::GetColorU32(ImGuiCol_Text);
    float centerX = position.x + size.x * 0.5f;
    float thickness = size.y * 0.07f;
    float capsuleHalfWidth = size.y * 0.1f;
    float capsuleTop = position.y + size.y * 0.22f;
    float capsuleBottom = position.y + size.y * 0.52f;
    drawList->AddRectFilled(ImVec2(centerX - capsuleHalfWidth, capsuleTop),
                            ImVec2(centerX + capsuleHalfWidth, capsuleBottom), color, capsuleHalfWidth);

    // The cradle around the capsule, open at the top, then the stem and the base.
    float cradleRadius = size.y * 0.19f;
    float cradleCenterY = capsuleBottom - cradleRadius * 0.55f;
    drawList->PathArcTo(ImVec2(centerX, cradleCenterY), cradleRadius, 0.f, 3.14159265f, 16);
    drawList->PathStroke(color, ImDrawFlags_None, thickness);
    float stemBottom = position.y + size.y * 0.78f;
    drawList->AddLine(ImVec2(centerX, cradleCenterY + cradleRadius), ImVec2(centerX, stemBottom), color, thickness);
    drawList->AddLine(ImVec2(centerX - size.y * 0.13f, stemBottom), ImVec2(centerX + size.y * 0.13f, stemBottom), color,
                      thickness);
}

void DrawGearIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size) {
    ImU32 color = ImGui::GetColorU32(ImGuiCol_Text);
    ImVec2 center = ImVec2(position.x + size.x * 0.5f, position.y + size.y * 0.5f);
    float toothRadius = size.y * 0.3f;
    float ringRadius = size.y * 0.21f;
    float thickness = size.y * 0.09f;
    for (int i = 0; i < 8; i++) {
        float angle = (float)i * (3.14159265f / 4.f);
        ImVec2 direction = ImVec2(cosf(angle), sinf(angle));
        drawList->AddLine(ImVec2(center.x + direction.x * ringRadius, center.y + direction.y * ringRadius),
                          ImVec2(center.x + direction.x * toothRadius, center.y + direction.y * toothRadius), color,
                          thickness);
    }
    drawList->AddCircle(center, ringRadius, color, 24, thickness);
}

void DrawSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color) {
    float top = position.y + size.y * 0.3f;
    float bottom = position.y + size.y * 0.7f;
    float middle = position.y + size.y * 0.5f;
    if (isNext) {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.3f, top), ImVec2(position.x + size.x * 0.3f, bottom),
                                    ImVec2(position.x + size.x * 0.62f, middle), color);
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.64f, top), ImVec2(position.x + size.x * 0.72f, bottom),
                                color);
    } else {
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.28f, top), ImVec2(position.x + size.x * 0.36f, bottom),
                                color);
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.7f, top),
                                    ImVec2(position.x + size.x * 0.38f, middle),
                                    ImVec2(position.x + size.x * 0.7f, bottom), color);
    }
}

void DrawKillSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color) {
    float top = position.y + size.y * 0.3f;
    float bottom = position.y + size.y * 0.7f;
    float middle = position.y + size.y * 0.5f;
    float ringRadius = size.y * 0.13f;
    float ringThickness = size.y * 0.06f;
    if (isNext) {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.24f, top),
                                    ImVec2(position.x + size.x * 0.24f, bottom),
                                    ImVec2(position.x + size.x * 0.5f, middle), color);
        ImVec2 center = ImVec2(position.x + size.x * 0.68f, middle);
        drawList->AddCircle(center, ringRadius, color, 12, ringThickness);
        drawList->AddCircleFilled(center, ringThickness * 0.8f, color, 8);
    } else {
        ImVec2 center = ImVec2(position.x + size.x * 0.32f, middle);
        drawList->AddCircle(center, ringRadius, color, 12, ringThickness);
        drawList->AddCircleFilled(center, ringThickness * 0.8f, color, 8);
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.76f, top),
                                    ImVec2(position.x + size.x * 0.5f, middle),
                                    ImVec2(position.x + size.x * 0.76f, bottom), color);
    }
}

void DrawHighlightSkipIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color) {
    float top = position.y + size.y * 0.3f;
    float bottom = position.y + size.y * 0.7f;
    float middle = position.y + size.y * 0.5f;
    ImVec2 starCenter = ImVec2(position.x + size.x * (isNext ? 0.68f : 0.32f), middle);
    if (isNext) {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.22f, top),
                                    ImVec2(position.x + size.x * 0.22f, bottom),
                                    ImVec2(position.x + size.x * 0.48f, middle), color);
    } else {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.78f, top),
                                    ImVec2(position.x + size.x * 0.52f, middle),
                                    ImVec2(position.x + size.x * 0.78f, bottom), color);
    }

    // A five-pointed star, drawn as its outline since it isn't convex.
    float outerRadius = size.y * 0.17f;
    float innerRadius = size.y * 0.075f;
    for (int i = 0; i < 10; i++) {
        float radius = i % 2 == 0 ? outerRadius : innerRadius;
        float angle = -3.14159265f / 2.f + (float)i * (3.14159265f / 5.f);
        drawList->PathLineTo(ImVec2(starCenter.x + cosf(angle) * radius, starCenter.y + sinf(angle) * radius));
    }
    drawList->PathStroke(color, ImDrawFlags_Closed, size.y * 0.05f);
}

void DrawLoopIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, ImU32 color) {
    ImVec2 center = ImVec2(position.x + size.x * 0.5f, position.y + size.y * 0.5f);
    float radius = size.y * 0.22f;
    float thickness = size.y * 0.07f;
    float headLength = size.y * 0.13f;
    float headHalfWidth = size.y * 0.08f;
    const float pi = 3.14159265f;
    // Each arc runs clockwise and stops short of the other to leave room for its arrowhead.
    for (int i = 0; i < 2; i++) {
        float startAngle = i == 0 ? -pi * 0.9f : pi * 0.1f;
        float endAngle = i == 0 ? -pi * 0.1f : pi * 0.9f;
        drawList->PathArcTo(center, radius, startAngle, endAngle, 12);
        drawList->PathStroke(color, ImDrawFlags_None, thickness);

        ImVec2 tip = ImVec2(center.x + cosf(endAngle) * radius, center.y + sinf(endAngle) * radius);
        ImVec2 tangent = ImVec2(-sinf(endAngle), cosf(endAngle));
        ImVec2 radial = ImVec2(cosf(endAngle), sinf(endAngle));
        drawList->AddTriangleFilled(ImVec2(tip.x + tangent.x * headLength, tip.y + tangent.y * headLength),
                                    ImVec2(tip.x + radial.x * headHalfWidth, tip.y + radial.y * headHalfWidth),
                                    ImVec2(tip.x - radial.x * headHalfWidth, tip.y - radial.y * headHalfWidth), color);
    }
}

void DrawRecordIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isStopping, ImU32 color) {
    ImVec2 center = ImVec2(position.x + size.x * 0.5f, position.y + size.y * 0.5f);
    float ringRadius = size.y * 0.24f;
    float ringThickness = size.y * 0.06f;
    drawList->AddCircle(center, ringRadius, color, 24, ringThickness);
    if (isStopping) {
        float halfSize = size.y * 0.1f;
        drawList->AddRectFilled(ImVec2(center.x - halfSize, center.y - halfSize),
                                ImVec2(center.x + halfSize, center.y + halfSize), color, size.y * 0.02f);
    } else {
        drawList->AddCircleFilled(center, size.y * 0.12f, color, 24);
    }
}

void DrawLockIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isLocked, ImU32 color) {
    float centerX = position.x + size.x * 0.5f;
    float bodyHalfWidth = size.y * 0.17f;
    float bodyTop = position.y + size.y * 0.47f;
    float bodyBottom = position.y + size.y * 0.75f;
    drawList->AddRectFilled(ImVec2(centerX - bodyHalfWidth, bodyTop), ImVec2(centerX + bodyHalfWidth, bodyBottom),
                            color, size.y * 0.04f);

    // The shackle is an arch over the body. Open, it is lifted with its right leg out of the body.
    float thickness = size.y * 0.07f;
    float radius = size.y * 0.11f;
    float archCenterY = position.y + size.y * (isLocked ? 0.36f : 0.29f);
    drawList->PathArcTo(ImVec2(centerX, archCenterY), radius, 3.14159265f, 2.f * 3.14159265f, 12);
    drawList->PathStroke(color, ImDrawFlags_None, thickness);
    drawList->AddLine(ImVec2(centerX - radius, archCenterY), ImVec2(centerX - radius, bodyTop), color, thickness);
    float rightLegBottom = isLocked ? bodyTop : archCenterY + size.y * 0.05f;
    drawList->AddLine(ImVec2(centerX + radius, archCenterY), ImVec2(centerX + radius, rightLegBottom), color,
                      thickness);
}

void DrawFrameStepIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color) {
    float top = position.y + size.y * 0.3f;
    float bottom = position.y + size.y * 0.7f;
    float middle = position.y + size.y * 0.5f;
    if (isNext) {
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.28f, top), ImVec2(position.x + size.x * 0.36f, bottom),
                                color);
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.38f, top),
                                    ImVec2(position.x + size.x * 0.38f, bottom),
                                    ImVec2(position.x + size.x * 0.7f, middle), color);
    } else {
        drawList->AddTriangleFilled(ImVec2(position.x + size.x * 0.62f, top),
                                    ImVec2(position.x + size.x * 0.3f, middle),
                                    ImVec2(position.x + size.x * 0.62f, bottom), color);
        drawList->AddRectFilled(ImVec2(position.x + size.x * 0.64f, top), ImVec2(position.x + size.x * 0.72f, bottom),
                                color);
    }
}

void DrawChevronIcon(ImDrawList* drawList, ImVec2 position, ImVec2 size, bool isNext, ImU32 color) {
    float top = position.y + size.y * 0.32f;
    float bottom = position.y + size.y * 0.68f;
    float middle = position.y + size.y * 0.5f;
    float tipX = position.x + size.x * (isNext ? 0.6f : 0.4f);
    float baseX = position.x + size.x * (isNext ? 0.42f : 0.58f);
    drawList->PathLineTo(ImVec2(baseX, top));
    drawList->PathLineTo(ImVec2(tipX, middle));
    drawList->PathLineTo(ImVec2(baseX, bottom));
    drawList->PathStroke(color, ImDrawFlags_None, size.y * 0.07f);
}
