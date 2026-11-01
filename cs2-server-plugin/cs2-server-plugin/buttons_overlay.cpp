#include "buttons_overlay.h"

#include <atomic>
#include <cstddef>

#include "log.h"
#include "maths.h"
#include "plugin.h"
#include "ui/playback_controls.h"

#ifdef _WIN32

#include "imgui.h"
#include "overlay.h"
#include "ui/buttons_panel.h"

static std::atomic<bool> isOverlayVisible{false};
static std::atomic<uint64_t> pressedButtons{0};
static std::atomic<float> spectatedPlayerSpeed{0.f};

// The panel's right middle point as fractions of the display size.
static std::atomic<float> panelFractionX{buttonsOverlayDefaultFractionX};
static std::atomic<float> panelFractionY{buttonsOverlayDefaultFractionY};
static std::atomic<bool> isDraggingPanel{false};

// Published by the render thread every frame for the mouse handlers, which run on the game's main thread and need
// the panel's rect for hit testing and dragging.
static std::atomic<float> panelLeft{0.f};
static std::atomic<float> panelTop{0.f};
static std::atomic<float> panelWidth{0.f};
static std::atomic<float> panelHeight{0.f};
static std::atomic<float> displayWidth{0.f};
static std::atomic<float> displayHeight{0.f};

// Only touched by the mouse handlers.
static float dragGrabOffsetX = 0.f;
static float dragGrabOffsetY = 0.f;

static bool IsInsidePanel(float x, float y) {
    float left = panelLeft;
    float top = panelTop;

    return panelWidth > 0.f && x >= left && x <= left + panelWidth && y >= top && y <= top + panelHeight;
}

static bool IsCursorOnPanel() {
    float x, y;

    return OverlayGetCursorPositionInWindow(&x, &y) && IsInsidePanel(x, y);
}

// Moves the panel's top left corner to (x, y) in display pixels.
static void MovePanelTo(float x, float y) {
    float width = displayWidth;
    float height = displayHeight;
    if (width <= 0.f || height <= 0.f) {
        return;
    }

    x = ClampToRange(x, 0.f, width - panelWidth);
    y = ClampToRange(y, 0.f, height - panelHeight);
    panelFractionX = (x + panelWidth) / width;
    panelFractionY = (y + panelHeight * 0.5f) / height;
}

bool ButtonsOverlayHandleMouseDown(float x, float y) {
    if (!isOverlayVisible || !IsInsidePanel(x, y)) {
        return false;
    }

    isDraggingPanel = true;
    dragGrabOffsetX = x - panelLeft;
    dragGrabOffsetY = y - panelTop;

    return true;
}

bool ButtonsOverlayHandleMouseMove(float x, float y, bool isLeftButtonHeld) {
    if (!isDraggingPanel) {
        return false;
    }

    // The game owns the mouse capture, so a release outside of the window can be missed.
    if (!isLeftButtonHeld) {
        isDraggingPanel = false;
        return false;
    }

    MovePanelTo(x - dragGrabOffsetX, y - dragGrabOffsetY);

    return true;
}

bool ButtonsOverlayHandleMouseUp(float x, float y) {
    (void)x;
    (void)y;

    if (!isDraggingPanel) {
        return false;
    }

    isDraggingPanel = false;

    return true;
}

void ButtonsOverlayCancelDrag() { isDraggingPanel = false; }

bool ButtonsOverlayIsMouseBusy() {
    if (isDraggingPanel) {
        return true;
    }

    return isOverlayVisible && IsCursorOnPanel();
}

static bool IsPanelHighlighted() {
    if (isDraggingPanel) {
        return true;
    }

    return IsCursorOnPanel();
}

static void PublishPanelLayout(ButtonsPanelLayout layout, ImVec2 displaySize) {
    panelLeft = layout.position.x;
    panelTop = layout.position.y;
    panelWidth = layout.size.x;
    panelHeight = layout.size.y;
    displayWidth = displaySize.x;
    displayHeight = displaySize.y;
}

void ButtonsOverlayDrawFrame(float width, float height) {
    ImVec2 displaySize = ImVec2(width, height);
    if (isOverlayVisible && isPlaybackActive) {
        ButtonsPanelState state = {};
        state.buttons = pressedButtons;
        state.speed = spectatedPlayerSpeed;
        state.fractionX = panelFractionX;
        state.fractionY = panelFractionY;
        state.isHighlighted = IsPanelHighlighted();
        state.backgroundOpacity = GetOverlayBackgroundOpacity();
        state.scale = GetOverlayScale();
        ButtonsPanelLayout layout = DrawButtonsPanel(state, displaySize);
        PublishPanelLayout(layout, displaySize);
    } else {
        // Publish an empty rect so a hidden panel stops swallowing the mouse.
        PublishPanelLayout(ButtonsPanelLayout{}, displaySize);
    }
}

void SetButtonsOverlayVisible(bool visible) { isOverlayVisible = visible; }

bool IsButtonsOverlayVisible() { return isOverlayVisible; }

void SetButtonsOverlayPressedButtons(uint64_t buttons) { pressedButtons = buttons; }

void SetButtonsOverlaySpeed(float speed) { spectatedPlayerSpeed = speed; }

void SetButtonsOverlayPosition(float fractionX, float fractionY) {
    panelFractionX = ClampToRange(fractionX, 0.f, 1.f);
    panelFractionY = ClampToRange(fractionY, 0.f, 1.f);
}

void GetButtonsOverlayPosition(float* fractionX, float* fractionY) {
    *fractionX = panelFractionX;
    *fractionY = panelFractionY;
}

#else

#include <dlfcn.h>

#include <cstdint>

typedef void (*OverlaySetVisibleFn)(int isVisible);
typedef void (*OverlaySetPressedButtonsFn)(uint64_t buttons);
typedef void (*OverlaySetSpeedFn)(float speed);
typedef void (*OverlaySetPositionFn)(float fractionX, float fractionY);
typedef void (*OverlaySetHighlightedFn)(int isHighlighted);
typedef int (*OverlayGetPanelRectFn)(float* x, float* y, float* width, float* height, float* displayWidth,
                                     float* displayHeight);

static OverlaySetVisibleFn layerSetVisible = NULL;
static OverlaySetPressedButtonsFn layerSetPressedButtons = NULL;
static OverlaySetSpeedFn layerSetSpeed = NULL;
static OverlaySetPositionFn layerSetPosition = NULL;
static OverlaySetHighlightedFn layerSetHighlighted = NULL;
static OverlayGetPanelRectFn layerGetPanelRect = NULL;

// Mirrored from the layer so the state survives the layer not being loaded and the commands reading it back answer
// the same on both platforms.
static std::atomic<bool> isOverlayVisible{false};
static std::atomic<uint64_t> pressedButtons{0};
static std::atomic<float> spectatedPlayerSpeed{0.f};
// The panel's right middle point as fractions of the display size.
static std::atomic<float> panelFractionX{buttonsOverlayDefaultFractionX};
static std::atomic<float> panelFractionY{buttonsOverlayDefaultFractionY};

// Only touched from the SDL event thread, where the mouse handlers run.
static bool isDraggingPanel = false;
static float dragGrabOffsetX = 0.f;
static float dragGrabOffsetY = 0.f;

static bool GetPanelRect(float& x, float& y, float& width, float& height, float& displayWidth, float& displayHeight) {
    return layerGetPanelRect != NULL && layerGetPanelRect(&x, &y, &width, &height, &displayWidth, &displayHeight) != 0;
}

static bool IsPointInPanel(float pointX, float pointY) {
    float x, y, width, height, displayWidth, displayHeight;
    if (!GetPanelRect(x, y, width, height, displayWidth, displayHeight)) {
        return false;
    }

    return width > 0.f && pointX >= x && pointX <= x + width && pointY >= y && pointY <= y + height;
}

static void SetPanelHighlighted(bool isHighlighted) {
    if (layerSetHighlighted != NULL) {
        layerSetHighlighted(isHighlighted ? 1 : 0);
    }
}

static void PushPanelPositionToLayer() {
    if (layerSetPosition != NULL) {
        layerSetPosition(panelFractionX, panelFractionY);
    }
}

// Moves the panel's top left corner to (x, y) in display pixels.
static void MovePanelTo(float x, float y, float panelWidth, float panelHeight, float displayWidth,
                        float displayHeight) {
    if (displayWidth <= 0.f || displayHeight <= 0.f) {
        return;
    }

    x = ClampToRange(x, 0.f, displayWidth - panelWidth);
    y = ClampToRange(y, 0.f, displayHeight - panelHeight);
    panelFractionX = (x + panelWidth) / displayWidth;
    panelFractionY = (y + panelHeight * 0.5f) / displayHeight;
    PushPanelPositionToLayer();
}

bool ButtonsOverlayHandleMouseDown(float x, float y) {
    if (!isOverlayVisible || !IsPointInPanel(x, y)) {
        return false;
    }

    float panelX, panelY, panelWidth, panelHeight, displayWidth, displayHeight;
    if (GetPanelRect(panelX, panelY, panelWidth, panelHeight, displayWidth, displayHeight)) {
        isDraggingPanel = true;
        dragGrabOffsetX = x - panelX;
        dragGrabOffsetY = y - panelY;
        SetPanelHighlighted(true);
    }

    return true;
}

bool ButtonsOverlayHandleMouseMove(float x, float y, bool isLeftButtonHeld) {
    if (!isDraggingPanel) {
        return false;
    }

    // A release outside of the window can be missed.
    if (!isLeftButtonHeld) {
        isDraggingPanel = false;
        SetPanelHighlighted(IsPointInPanel(x, y));
        return false;
    }

    float panelX, panelY, panelWidth, panelHeight, displayWidth, displayHeight;
    if (GetPanelRect(panelX, panelY, panelWidth, panelHeight, displayWidth, displayHeight)) {
        MovePanelTo(x - dragGrabOffsetX, y - dragGrabOffsetY, panelWidth, panelHeight, displayWidth, displayHeight);
    }

    return true;
}

bool ButtonsOverlayHandleMouseUp(float x, float y) {
    if (!isDraggingPanel) {
        return false;
    }

    isDraggingPanel = false;
    SetPanelHighlighted(IsPointInPanel(x, y));

    return true;
}

void ButtonsOverlayCancelDrag() { isDraggingPanel = false; }

void ButtonsOverlayUpdateHighlight(bool isMouseUsable, float x, float y) {
    SetPanelHighlighted(isMouseUsable && IsPointInPanel(x, y));
}

bool ButtonsOverlayIsMouseBusy(float x, float y) {
    if (isDraggingPanel) {
        return true;
    }

    return isOverlayVisible && IsPointInPanel(x, y);
}

// The layer only draws the panel during a demo playback, which it learns from the playback panel state.
static void PushVisibilityToLayer() {
    if (layerSetVisible != NULL) {
        layerSetVisible(isOverlayVisible ? 1 : 0);
    }
}

bool ButtonsOverlayConnectLayer(void* layerLib) {
    layerSetVisible = (OverlaySetVisibleFn)dlsym(layerLib, "CsdmOverlaySetVisible");
    layerSetPressedButtons = (OverlaySetPressedButtonsFn)dlsym(layerLib, "CsdmOverlaySetPressedButtons");
    layerSetSpeed = (OverlaySetSpeedFn)dlsym(layerLib, "CsdmOverlaySetSpeed");
    layerSetPosition = (OverlaySetPositionFn)dlsym(layerLib, "CsdmOverlaySetPosition");
    layerSetHighlighted = (OverlaySetHighlightedFn)dlsym(layerLib, "CsdmOverlaySetHighlighted");
    layerGetPanelRect = (OverlayGetPanelRectFn)dlsym(layerLib, "CsdmOverlayGetPanelRect");
    if (layerSetVisible == NULL || layerSetPressedButtons == NULL || layerSetSpeed == NULL ||
        layerSetPosition == NULL || layerSetHighlighted == NULL || layerGetPanelRect == NULL) {
        return false;
    }

    // The layer starts hidden and empty, so replay everything set before it was connected.
    PushPanelPositionToLayer();
    layerSetPressedButtons(pressedButtons);
    layerSetSpeed(spectatedPlayerSpeed);
    PushVisibilityToLayer();

    return true;
}

void ButtonsOverlayDisconnectLayer() {
    if (layerSetVisible != NULL) {
        layerSetVisible(0);
    }
    layerSetVisible = NULL;
    layerSetPressedButtons = NULL;
    layerSetSpeed = NULL;
    layerSetPosition = NULL;
    layerSetHighlighted = NULL;
    layerGetPanelRect = NULL;
}

void SetButtonsOverlayVisible(bool visible) {
    isOverlayVisible = visible;
    PushVisibilityToLayer();
}

bool IsButtonsOverlayVisible() { return isOverlayVisible; }

void SetButtonsOverlayPressedButtons(uint64_t buttons) {
    pressedButtons = buttons;
    if (layerSetPressedButtons != NULL) {
        layerSetPressedButtons(buttons);
    }
}

void SetButtonsOverlaySpeed(float speed) {
    spectatedPlayerSpeed = speed;
    if (layerSetSpeed != NULL) {
        layerSetSpeed(speed);
    }
}

void SetButtonsOverlayPosition(float fractionX, float fractionY) {
    panelFractionX = ClampToRange(fractionX, 0.f, 1.f);
    panelFractionY = ClampToRange(fractionY, 0.f, 1.f);
    PushPanelPositionToLayer();
}

void GetButtonsOverlayPosition(float* fractionX, float* fractionY) {
    *fractionX = panelFractionX;
    *fractionY = panelFractionY;
}

#endif
