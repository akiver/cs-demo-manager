#include <dlfcn.h>

#include <atomic>
#include <cstdint>
#include <string>

#include "buttons_overlay.h"
#include "log.h"
#include "maths.h"
#include "overlay.h"
#include "playback_overlay.h"
#include "plugin.h"
#include "sdl.h"
#include "ui/playback_controls.h"
#include "voice_indicator.h"

// The plugin draws nothing on Linux: each panel module forwards its state to the Vulkan layer, the only place with a
// handle on the device the game renders with, see vulkan-layer/.
#define VULKAN_LAYER_LIB_PATH "/csgo/csdm/vulkan/libcsdm_vulkan_layer.so"

static void* layerLib = NULL;

// The layer intercepts no input, so the plugin feeds it the SDL mouse and keyboard events and asks it whether ImGui
// wants them.
typedef void (*LayerMouseMoveFn)(float x, float y);
typedef void (*LayerMouseLeaveFn)();
typedef void (*LayerMouseButtonFn)(int button, int isDown);
typedef int (*LayerWantsMouseFn)();
typedef void (*LayerKeyFn)(int key, int isDown);
typedef void (*LayerCharacterFn)(unsigned int character);
typedef void (*LayerFocusLostFn)();
typedef int (*LayerWantsKeyboardFn)();

static LayerMouseMoveFn layerMouseMove = NULL;
static LayerMouseLeaveFn layerMouseLeave = NULL;
static LayerMouseButtonFn layerMouseButton = NULL;
static LayerWantsMouseFn layerWantsMouse = NULL;
static LayerKeyFn layerKey = NULL;
static LayerCharacterFn layerCharacter = NULL;
static LayerFocusLostFn layerFocusLost = NULL;
static LayerWantsKeyboardFn layerWantsKeyboard = NULL;

static bool isPressCaptured = false;

typedef void (*LayerSetBackgroundOpacityFn)(float opacity);
static LayerSetBackgroundOpacityFn layerSetBackgroundOpacity = NULL;
static float backgroundOpacity = overlayDefaultBackgroundOpacity;

void SetOverlayBackgroundOpacity(float opacity) {
    backgroundOpacity = ClampToRange(opacity, 0.f, 1.f);
    if (layerSetBackgroundOpacity != NULL) {
        layerSetBackgroundOpacity(backgroundOpacity);
    }
}

float GetOverlayBackgroundOpacity() { return backgroundOpacity; }

static void ConnectLayerBackgroundOpacity(void* lib) {
    layerSetBackgroundOpacity = (LayerSetBackgroundOpacityFn)dlsym(lib, "CsdmOverlaySetBackgroundOpacity");
    if (layerSetBackgroundOpacity == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support the background opacity, it stays at its "
            "default");
        return;
    }

    layerSetBackgroundOpacity(backgroundOpacity);
}

typedef void (*LayerSetScaleFn)(float scale);
static LayerSetScaleFn layerSetScale = NULL;
static float overlayScale = overlayDefaultScale;

void SetOverlayScale(float scale) {
    overlayScale = ClampToRange(scale, overlayMinScale, overlayMaxScale);
    if (layerSetScale != NULL) {
        layerSetScale(overlayScale);
    }
}

float GetOverlayScale() { return overlayScale; }

static void ConnectLayerScale(void* lib) {
    layerSetScale = (LayerSetScaleFn)dlsym(lib, "CsdmOverlaySetScale");
    if (layerSetScale == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support the overlay scale, it stays at its default");
        return;
    }

    layerSetScale(overlayScale);
}

typedef void (*LayerSetTooltipsEnabledFn)(int isEnabled);
static LayerSetTooltipsEnabledFn layerSetTooltipsEnabled = NULL;
static std::atomic<bool> areTooltipsEnabled{true};

void SetOverlayTooltipsEnabled(bool isEnabled) {
    areTooltipsEnabled = isEnabled;
    if (layerSetTooltipsEnabled != NULL) {
        layerSetTooltipsEnabled(areTooltipsEnabled ? 1 : 0);
    }
}

bool AreOverlayTooltipsEnabled() { return areTooltipsEnabled; }

typedef void (*LayerShowToastFn)(const char* text);
static LayerShowToastFn layerShowToast = NULL;

void ShowOverlayToast(const char* text) {
    if (layerShowToast != NULL) {
        layerShowToast(text);
    }
}

static void ConnectLayerToasts(void* lib) {
    layerShowToast = (LayerShowToastFn)dlsym(lib, "CsdmOverlayShowToast");
    if (layerShowToast == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support toasts, nothing will be shown");
    }
}

typedef void (*LayerSetDrawnInCapturesFn)(int isDrawn);
static LayerSetDrawnInCapturesFn layerSetDrawnInCaptures = NULL;
static std::atomic<bool> arePanelsDrawnInCaptures{true};

void SetOverlayDrawnInCaptures(bool isDrawn) {
    arePanelsDrawnInCaptures = isDrawn;
    if (layerSetDrawnInCaptures != NULL) {
        layerSetDrawnInCaptures(isDrawn ? 1 : 0);
    }
}

static void ConnectLayerDrawnInCaptures(void* lib) {
    layerSetDrawnInCaptures = (LayerSetDrawnInCapturesFn)dlsym(lib, "CsdmOverlaySetDrawnInCaptures");
    if (layerSetDrawnInCaptures == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support leaving the panels out of the captured "
            "frames, they may be in the camera previews");
        return;
    }

    layerSetDrawnInCaptures(arePanelsDrawnInCaptures ? 1 : 0);
}

typedef void (*LayerSetGameDirectoryFn)(const char* directory);

static void ConnectLayerGameDirectory(void* lib) {
    auto layerSetGameDirectory = (LayerSetGameDirectoryFn)dlsym(lib, "CsdmOverlaySetGameDirectory");
    if (layerSetGameDirectory == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support loading the font of the game, names written "
            "in another script than Latin will be drawn as question marks");
        return;
    }

    layerSetGameDirectory(gameDirectory.c_str());
}

static void ConnectLayerTooltipsEnabled(void* lib) {
    layerSetTooltipsEnabled = (LayerSetTooltipsEnabledFn)dlsym(lib, "CsdmOverlaySetTooltipsEnabled");
    if (layerSetTooltipsEnabled == NULL) {
        Log("Overlay: the Vulkan layer loaded in the game doesn't support toggling tooltips, they stay enabled");
        return;
    }

    layerSetTooltipsEnabled(areTooltipsEnabled ? 1 : 0);
}

static bool ConnectLayerInput(void* lib) {
    layerMouseMove = (LayerMouseMoveFn)dlsym(lib, "CsdmOverlayMouseMove");
    layerMouseLeave = (LayerMouseLeaveFn)dlsym(lib, "CsdmOverlayMouseLeave");
    layerMouseButton = (LayerMouseButtonFn)dlsym(lib, "CsdmOverlayMouseButton");
    layerWantsMouse = (LayerWantsMouseFn)dlsym(lib, "CsdmOverlayWantsMouse");
    layerKey = (LayerKeyFn)dlsym(lib, "CsdmOverlayKey");
    layerCharacter = (LayerCharacterFn)dlsym(lib, "CsdmOverlayCharacter");
    layerFocusLost = (LayerFocusLostFn)dlsym(lib, "CsdmOverlayFocusLost");
    layerWantsKeyboard = (LayerWantsKeyboardFn)dlsym(lib, "CsdmOverlayWantsKeyboard");

    return layerMouseMove != NULL && layerMouseLeave != NULL && layerMouseButton != NULL && layerWantsMouse != NULL &&
           layerKey != NULL && layerCharacter != NULL && layerFocusLost != NULL && layerWantsKeyboard != NULL;
}

static void DisconnectLayerInput() {
    layerMouseMove = NULL;
    layerMouseLeave = NULL;
    layerMouseButton = NULL;
    layerWantsMouse = NULL;
    layerKey = NULL;
    layerCharacter = NULL;
    layerFocusLost = NULL;
    layerWantsKeyboard = NULL;
}

static bool LayerWantsMouse() { return layerWantsMouse != NULL && layerWantsMouse() != 0; }

static bool LayerWantsKeyboard() { return layerWantsKeyboard != NULL && layerWantsKeyboard() != 0; }

// CS2 reads its input through SDL3 on Linux, so clicks on the panels and what is typed in their fields are taken from
// an SDL event filter.
static SdlSetEventFilterFn sdlSetEventFilter = NULL;
static SdlGetEventFilterFn sdlGetEventFilter = NULL;
static SdlGetWindowFromIdFn sdlGetWindowFromId = NULL;
static SdlGetWindowRelativeMouseModeFn sdlGetWindowRelativeMouseMode = NULL;
static SdlGetKeyFromScancodeFn sdlGetKeyFromScancode = NULL;

// The game's own event filter, called for every event the panels don't take.
static SdlEventFilter originalSdlEventFilter = NULL;
static void* originalSdlEventFilterUserData = NULL;
static bool isSdlEventFilterInstalled = false;

static bool IsMouseUsable(SdlWindowId windowId) {
    if (sdlGetWindowFromId == NULL || sdlGetWindowRelativeMouseMode == NULL) {
        return true;
    }

    void* window = sdlGetWindowFromId(windowId);

    return window == NULL || !sdlGetWindowRelativeMouseMode(window);
}

static bool ForwardToGame(SdlEvent* event) {
    return originalSdlEventFilter == NULL || originalSdlEventFilter(originalSdlEventFilterUserData, event);
}

static bool IsMouseOnAnyPanel(SdlWindowId windowId, float x, float y) {
    return ButtonsOverlayIsMouseBusy(x, y) || (IsMouseUsable(windowId) && LayerWantsMouse());
}

static bool GetOverlayKey(SdlKeycode keycode, OverlayKey* key) {
    switch (keycode) {
        case SDLK_RETURN:
        case SDLK_KP_ENTER:
            *key = OVERLAY_KEY_ENTER;
            return true;
        case SDLK_ESCAPE:
            *key = OVERLAY_KEY_ESCAPE;
            return true;
        case SDLK_BACKSPACE:
            *key = OVERLAY_KEY_BACKSPACE;
            return true;
        case SDLK_DELETE:
            *key = OVERLAY_KEY_DELETE;
            return true;
        case SDLK_LEFT:
            *key = OVERLAY_KEY_LEFT;
            return true;
        case SDLK_RIGHT:
            *key = OVERLAY_KEY_RIGHT;
            return true;
        case SDLK_HOME:
            *key = OVERLAY_KEY_HOME;
            return true;
        case SDLK_END:
            *key = OVERLAY_KEY_END;
            return true;
    }

    return false;
}

// The keycode of a key with the modifiers held applied. The keycode of key events leaves them out: Shift+; is ';', not
// the ':' it types on a US layout.
static SdlKeycode GetModifiedKeycode(const SdlKeyboardEvent& event) {
    if (sdlGetKeyFromScancode == NULL) {
        return event.key;
    }

    return sdlGetKeyFromScancode(event.scancode, event.mod, false);
}

// The digit a keypad key types, 0 for other keys. Keypad keycodes are not the character they type, unlike other keys.
static unsigned int GetKeypadDigit(SdlKeycode keycode) {
    if (keycode >= SDLK_KP_1 && keycode <= SDLK_KP_9) {
        return '1' + (keycode - SDLK_KP_1);
    }
    if (keycode == SDLK_KP_0) {
        return '0';
    }

    return 0;
}

// The character a key press types, as a Unicode code point, 0 when it types none. SDL only generates text input events
// while the game has text input on, so the character is worked out from the key.
static unsigned int GetTypedCharacter(const SdlKeyboardEvent& event) {
    bool isShortcut = (event.mod & (SDL_KMOD_CTRL | SDL_KMOD_GUI)) != 0;
    if (isShortcut) {
        return 0;
    }

    SdlKeycode keycode = GetModifiedKeycode(event);

    bool isNumLockOn = (event.mod & SDL_KMOD_NUM) != 0;
    unsigned int keypadDigit = GetKeypadDigit(keycode);
    if (isNumLockOn && keypadDigit != 0) {
        return keypadDigit;
    }

    // Enter, Backspace, Escape... have control character keycodes.
    bool isControlCharacter = keycode < 0x20 || keycode == SDLK_DELETE;
    bool isCharacterKey = (keycode & SDLK_SCANCODE_MASK) == 0;
    if (isControlCharacter || !isCharacterKey) {
        return 0;
    }

    return keycode;
}

static void FeedRightButton(const SdlEvent* event, int isDown) {
    if (event->button.button != SDL_BUTTON_RIGHT || layerMouseButton == NULL) {
        return;
    }

    if (isDown && !IsMouseUsable(event->button.windowId)) {
        return;
    }

    layerMouseButton(OVERLAY_MOUSE_BUTTON_RIGHT, isDown);
}

// SDL calls this for every event as it is queued, before the game reads it. Returning false drops the event.
static bool CsdmSdlEventFilter(void* userData, SdlEvent* event) {
    (void)userData;

    if (event == NULL || !IsAnyPanelVisible()) {
        if (isPressCaptured) {
            // The panels were hidden mid-press. The game gets the release, so the capture ends here.
            isPressCaptured = false;
            if (layerMouseButton != NULL) {
                layerMouseButton(OVERLAY_MOUSE_BUTTON_LEFT, 0);
            }
        }
        return ForwardToGame(event);
    }

    switch (event->type) {
        case SDL_EVENT_MOUSE_BUTTON_DOWN:
            if (event->button.button != SDL_BUTTON_LEFT) {
                FeedRightButton(event, 1);
                // Right and middle clicks over a panel are kept from the game too.
                if (IsMouseOnAnyPanel(event->button.windowId, event->button.x, event->button.y)) {
                    return false;
                }
                break;
            }
            if (!IsMouseUsable(event->button.windowId)) {
                break;
            }

            if (ButtonsOverlayHandleMouseDown(event->button.x, event->button.y)) {
                return false;
            }

            if (layerMouseButton != NULL) {
                layerMouseButton(OVERLAY_MOUSE_BUTTON_LEFT, 1);
            }
            if (LayerWantsMouse()) {
                isPressCaptured = true;
                return false;
            }
            break;

        case SDL_EVENT_MOUSE_MOTION: {
            bool isLeftButtonHeld = (event->motion.state & SDL_BUTTON_LMASK) != 0;
            if (ButtonsOverlayHandleMouseMove(event->motion.x, event->motion.y, isLeftButtonHeld)) {
                return false;
            }

            bool isMouseUsable = IsMouseUsable(event->motion.windowId);
            ButtonsOverlayUpdateHighlight(isMouseUsable, event->motion.x, event->motion.y);
            if (isMouseUsable) {
                if (layerMouseMove != NULL) {
                    layerMouseMove(event->motion.x, event->motion.y);
                }
                if (LayerWantsMouse()) {
                    return false;
                }
            } else if (layerMouseLeave != NULL) {
                layerMouseLeave();
            }
            break;
        }

        case SDL_EVENT_MOUSE_BUTTON_UP:
            if (event->button.button != SDL_BUTTON_LEFT) {
                FeedRightButton(event, 0);
                if (IsMouseOnAnyPanel(event->button.windowId, event->button.x, event->button.y)) {
                    return false;
                }
                break;
            }

            if (ButtonsOverlayHandleMouseUp(event->button.x, event->button.y)) {
                return false;
            }

            if (layerMouseButton != NULL) {
                layerMouseButton(OVERLAY_MOUSE_BUTTON_LEFT, 0);
            }
            if (isPressCaptured) {
                isPressCaptured = false;
                return false;
            }
            break;

        case SDL_EVENT_MOUSE_WHEEL:
            if (IsMouseOnAnyPanel(event->wheel.windowId, event->wheel.mouseX, event->wheel.mouseY)) {
                return false;
            }
            break;

        case SDL_EVENT_KEY_DOWN:
        case SDL_EVENT_KEY_UP: {
            // Every key goes to ImGui, not only the ones typed in a field: a key released after its field was left
            // would otherwise stay held for ImGui, which would then ignore its next press.
            OverlayKey key;
            if (layerKey != NULL && GetOverlayKey(event->key.key, &key)) {
                layerKey(key, event->type == SDL_EVENT_KEY_DOWN ? 1 : 0);
            }
            if (event->type == SDL_EVENT_KEY_DOWN && layerCharacter != NULL) {
                unsigned int character = GetTypedCharacter(event->key);
                if (character != 0) {
                    layerCharacter(character);
                }
            }

            // While a field is typed in, the keys are kept from the game, digits would switch the spectated player.
            if (LayerWantsKeyboard()) {
                return false;
            }
            break;
        }

        case SDL_EVENT_TEXT_EDITING:
        case SDL_EVENT_TEXT_INPUT:
            if (LayerWantsKeyboard()) {
                return false;
            }
            break;

        case SDL_EVENT_WINDOW_FOCUS_LOST:
            if (layerFocusLost != NULL) {
                layerFocusLost();
            }
            break;
    }

    return ForwardToGame(event);
}

static void InstallSdlEventFilter() {
    if (isSdlEventFilterInstalled) {
        return;
    }

    void* sdlLib = dlopen(SDL_LIB_NAME, RTLD_NOW | RTLD_NOLOAD);
    if (sdlLib == NULL) {
        Log("Overlay: %s isn't loaded, the panels can't be clicked with the mouse", SDL_LIB_NAME);
        return;
    }

    sdlSetEventFilter = (SdlSetEventFilterFn)dlsym(sdlLib, "SDL_SetEventFilter");
    sdlGetEventFilter = (SdlGetEventFilterFn)dlsym(sdlLib, "SDL_GetEventFilter");
    sdlGetWindowFromId = (SdlGetWindowFromIdFn)dlsym(sdlLib, "SDL_GetWindowFromID");
    sdlGetWindowRelativeMouseMode = (SdlGetWindowRelativeMouseModeFn)dlsym(sdlLib, "SDL_GetWindowRelativeMouseMode");
    sdlGetKeyFromScancode = (SdlGetKeyFromScancodeFn)dlsym(sdlLib, "SDL_GetKeyFromScancode");
    dlclose(sdlLib);

    if (sdlSetEventFilter == NULL || sdlGetEventFilter == NULL) {
        Log("Overlay: SDL doesn't export the event filter functions, the panels can't be clicked with the mouse");
        return;
    }

    // Chain the game's filter, if any, but never ours: ForwardToGame would call it forever.
    if (!sdlGetEventFilter(&originalSdlEventFilter, &originalSdlEventFilterUserData) ||
        originalSdlEventFilter == &CsdmSdlEventFilter) {
        originalSdlEventFilter = NULL;
        originalSdlEventFilterUserData = NULL;
    }

    sdlSetEventFilter(&CsdmSdlEventFilter, NULL);
    isSdlEventFilterInstalled = true;
    Log("Overlay: SDL event filter installed, the panels can be clicked with the mouse");
}

static void RemoveSdlEventFilter() {
    ButtonsOverlayCancelDrag();
    if (!isSdlEventFilterInstalled || sdlSetEventFilter == NULL) {
        return;
    }

    // Restore the game's filter only while ours is the current one, so a filter installed after ours isn't dropped.
    SdlEventFilter currentFilter = NULL;
    void* currentUserData = NULL;
    if (sdlGetEventFilter != NULL && sdlGetEventFilter(&currentFilter, &currentUserData) &&
        currentFilter == &CsdmSdlEventFilter) {
        sdlSetEventFilter(originalSdlEventFilter, originalSdlEventFilterUserData);
    }

    isSdlEventFilterInstalled = false;
}

void InstallOverlay() {
    if (gameDirectory.empty()) {
        return;
    }

    if (layerLib == NULL) {
        std::string path = gameDirectory + VULKAN_LAYER_LIB_PATH;
        // RTLD_NOLOAD because loading the layer from here would be pointless: it can only draw from the layer chain the
        // Vulkan loader built when the game created its instance.
        layerLib = dlopen(path.c_str(), RTLD_NOW | RTLD_NOLOAD);
        if (layerLib == NULL) {
            Log("Overlay: the Vulkan layer isn't loaded in the game, nothing will be drawn. It is enabled when CS is "
                "started from CS Demo Manager, and requires the game to render with Vulkan");
            return;
        }

        if (!ButtonsOverlayConnectLayer(layerLib) || !PlaybackOverlayConnectLayer(layerLib) ||
            !VoiceIndicatorConnectLayer(layerLib) || !ConnectLayerInput(layerLib)) {
            Log("Overlay: the Vulkan layer loaded in the game doesn't export what the plugin expects, it is probably "
                "not the one shipped with this version, nothing will be drawn");
            ButtonsOverlayDisconnectLayer();
            PlaybackOverlayDisconnectLayer();
            VoiceIndicatorDisconnectLayer();
            DisconnectLayerInput();
            layerSetBackgroundOpacity = NULL;
            layerSetScale = NULL;
            layerSetTooltipsEnabled = NULL;
            dlclose(layerLib);
            layerLib = NULL;
            return;
        }

        ConnectLayerGameDirectory(layerLib);
        ConnectLayerBackgroundOpacity(layerLib);
        ConnectLayerScale(layerLib);
        ConnectLayerTooltipsEnabled(layerLib);
        ConnectLayerToasts(layerLib);
        ConnectLayerDrawnInCaptures(layerLib);

        Log("Overlay: connected to the Vulkan layer");
    }

    InstallSdlEventFilter();
}

void RemoveOverlay() {
    SetButtonsOverlayVisible(false);
    SetPlaybackPanelVisible(false);
    SetVoiceIndicatorVisible(false);
    RemoveSdlEventFilter();

    if (layerLib == NULL) {
        return;
    }

    ButtonsOverlayDisconnectLayer();
    PlaybackOverlayDisconnectLayer();
    VoiceIndicatorDisconnectLayer();
    DisconnectLayerInput();
    layerSetBackgroundOpacity = NULL;
    layerSetScale = NULL;
    layerSetTooltipsEnabled = NULL;
    layerShowToast = NULL;
    layerSetDrawnInCaptures = NULL;
    dlclose(layerLib);
    layerLib = NULL;
}

bool IsAnyPanelVisible() { return IsButtonsOverlayVisible() || IsPlaybackPanelVisible() || IsVoiceIndicatorDrawn(); }