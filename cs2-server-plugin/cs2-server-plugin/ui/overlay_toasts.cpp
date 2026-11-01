#include "overlay_toasts.h"

#include <algorithm>
#include <cstddef>
#include <cstdio>
#include <cstring>
#include <mutex>

#include "maths.h"
#include "overlay_palette.h"

constexpr int toastTextSize = 128;
constexpr int maxToasts = 3;
constexpr double toastDurationSeconds = 3.0;
constexpr double toastFadeSeconds = 0.5;

struct OverlayToast {
    char text[toastTextSize];
    // ImGui time of the first frame the toast was drawn, negative until then. Toasts are queued from the game thread,
    // which has no access to that clock.
    double shownAt;
};

static std::mutex toastsMutex;
static OverlayToast toasts[maxToasts];
static int toastCount = 0;

void QueueOverlayToast(const char* text) {
    if (text == NULL || text[0] == '\0') {
        return;
    }

    std::lock_guard<std::mutex> lock(toastsMutex);
    if (toastCount == maxToasts) {
        // The oldest one makes room.
        memmove(&toasts[0], &toasts[1], sizeof(OverlayToast) * (maxToasts - 1));
        toastCount--;
    }
    OverlayToast& toast = toasts[toastCount++];
    snprintf(toast.text, sizeof(toast.text), "%s", text);
    toast.shownAt = -1.0;
}

bool HasOverlayToasts() {
    std::lock_guard<std::mutex> lock(toastsMutex);

    return toastCount > 0;
}

void DrawOverlayToasts(float backgroundOpacity, float userScale, bool hasAnchor, ImVec2 anchorPosition,
                       ImVec2 anchorSize) {
    ImVec2 displaySize = ImGui::GetIO().DisplaySize;
    if (displaySize.x <= 0.f || displaySize.y <= 0.f) {
        return;
    }

    // The toasts still alive are copied so the drawing runs outside the lock.
    double now = ImGui::GetTime();
    OverlayToast shown[maxToasts];
    int shownCount = 0;
    {
        std::lock_guard<std::mutex> lock(toastsMutex);
        int keptCount = 0;
        for (int i = 0; i < toastCount; i++) {
            OverlayToast toast = toasts[i];
            if (toast.shownAt < 0.0) {
                toast.shownAt = now;
            }
            if (now - toast.shownAt >= toastDurationSeconds) {
                continue;
            }
            toasts[keptCount++] = toast;
            shown[shownCount++] = toast;
        }
        toastCount = keptCount;
    }
    if (shownCount == 0) {
        return;
    }

    // Same proportions whatever the resolution is, 1080p being the reference, times the factor the user set.
    float scale = displaySize.y / 1080.f * userScale;
    ImGuiStyle& style = ImGui::GetStyle();
    ImGui::PushFont(NULL, style.FontSizeBase * scale * 1.4f);
    ImVec2 padding = ImVec2(14.f * scale, 8.f * scale);
    float gap = 10.f * scale;
    float spacing = 6.f * scale;
    // Above the panel when it sits in the lower half of the display, below it otherwise, stacking away from it.
    bool isAbovePanel = hasAnchor && anchorPosition.y + anchorSize.y * 0.5f >= displaySize.y * 0.5f;
    float centerX = hasAnchor ? anchorPosition.x + anchorSize.x * 0.5f : displaySize.x * 0.5f;
    float edgeY = !hasAnchor     ? 40.f * scale
                  : isAbovePanel ? anchorPosition.y - gap
                                 : anchorPosition.y + anchorSize.y + gap;

    ImGui::PushStyleVar(ImGuiStyleVar_WindowPadding, padding);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowRounding, 8.f * scale);
    ImGui::PushStyleVar(ImGuiStyleVar_WindowBorderSize, 2.f * scale);
    ImGui::PushStyleColor(ImGuiCol_WindowBg, ToBackgroundColor(overlayMenuBackgroundColor, backgroundOpacity));
    ImGui::PushStyleColor(ImGuiCol_Border, overlayBorderColor.ToVec4());
    ImGui::PushStyleColor(ImGuiCol_Text, overlayTextColor.ToVec4());

    ImGuiWindowFlags flags = ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | ImGuiWindowFlags_NoMove |
                             ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoScrollWithMouse |
                             ImGuiWindowFlags_NoCollapse | ImGuiWindowFlags_NoSavedSettings | ImGuiWindowFlags_NoNav |
                             ImGuiWindowFlags_NoInputs | ImGuiWindowFlags_NoFocusOnAppearing |
                             ImGuiWindowFlags_NoBringToFrontOnFocus;
    float y = edgeY;
    for (int i = shownCount - 1; i >= 0; i--) {
        const OverlayToast& toast = shown[i];
        double secondsLeft = toastDurationSeconds - (now - toast.shownAt);
        float alpha = secondsLeft < toastFadeSeconds ? (float)(secondsLeft / toastFadeSeconds) : 1.f;
        ImVec2 textSize = ImGui::CalcTextSize(toast.text);
        ImVec2 windowSize = ImVec2(textSize.x + padding.x * 2.f, textSize.y + padding.y * 2.f);
        float top = isAbovePanel ? y - windowSize.y : y;
        float left =
            ClampToRange(centerX - windowSize.x * 0.5f, gap, std::max(gap, displaySize.x - gap - windowSize.x));

        char id[32];
        snprintf(id, sizeof(id), "csdm_toast_%d", i);
        ImGui::PushStyleVar(ImGuiStyleVar_Alpha, alpha);
        ImGui::SetNextWindowPos(ImVec2(left, top), ImGuiCond_Always);
        ImGui::SetNextWindowSize(windowSize, ImGuiCond_Always);
        if (ImGui::Begin(id, NULL, flags)) {
            ImGui::TextUnformatted(toast.text);
        }
        ImGui::End();
        ImGui::PopStyleVar();

        y = isAbovePanel ? top - spacing : top + windowSize.y + spacing;
    }

    ImGui::PopStyleColor(3);
    ImGui::PopStyleVar(3);
    ImGui::PopFont();
}
