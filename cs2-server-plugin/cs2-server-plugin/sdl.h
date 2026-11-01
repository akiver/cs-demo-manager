#pragma once

#include <cstdint>

// CS2 uses SDL3 for rendering and input on Linux. The plugin doesn't link it and resolves what it needs at runtime
// from the copy the game loaded.
#define SDL_LIB_NAME "libSDL3.so.0"

// Just enough of the SDL3 ABI for what the plugin does with it: read mouse and keyboard events, chain the event filter
// and show a message box. Values, structs and signatures come from the 3.2 release branch the game ships:
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_keyboard.h
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_keycode.h
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_messagebox.h
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_mouse.h
// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_video.h
#define SDL_EVENT_WINDOW_FOCUS_LOST 0x20Fu
#define SDL_EVENT_KEY_DOWN 0x300u
#define SDL_EVENT_KEY_UP 0x301u
#define SDL_EVENT_TEXT_EDITING 0x302u
#define SDL_EVENT_TEXT_INPUT 0x303u
#define SDL_EVENT_MOUSE_MOTION 0x400u
#define SDL_EVENT_MOUSE_BUTTON_DOWN 0x401u
#define SDL_EVENT_MOUSE_BUTTON_UP 0x402u
#define SDL_EVENT_MOUSE_WHEEL 0x403u
#define SDL_BUTTON_LEFT 1
#define SDL_BUTTON_RIGHT 3
#define SDL_BUTTON_LMASK (1u << (SDL_BUTTON_LEFT - 1))
// Set in the keycode of keys that don't type a character (arrows, F1, keypad...), the keycode of the others being the
// character they type.
#define SDLK_SCANCODE_MASK (1u << 30)
#define SDLK_RETURN 0x0000000du
#define SDLK_ESCAPE 0x0000001bu
#define SDLK_BACKSPACE 0x00000008u
#define SDLK_DELETE 0x0000007fu
#define SDLK_HOME 0x4000004au
#define SDLK_END 0x4000004du
#define SDLK_RIGHT 0x4000004fu
#define SDLK_LEFT 0x40000050u
#define SDLK_KP_ENTER 0x40000058u
#define SDLK_KP_1 0x40000059u
#define SDLK_KP_9 0x40000061u
#define SDLK_KP_0 0x40000062u
#define SDL_KMOD_CTRL 0x00C0u
#define SDL_KMOD_GUI 0x0C00u
#define SDL_KMOD_NUM 0x1000u
#define SDL_MESSAGEBOX_ERROR 0x10u

typedef uint32_t SdlWindowId;
typedef uint32_t SdlKeycode;
typedef uint16_t SdlKeymod;
// An enum in SDL, int sized.
typedef int SdlScancode;

// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h#L351
struct SdlKeyboardEvent {
    uint32_t type;
    uint32_t reserved;
    uint64_t timestamp;
    SdlWindowId windowId;
    uint32_t which;
    SdlScancode scancode;
    SdlKeycode key;
    SdlKeymod mod;
    uint16_t raw;
    bool down;
    bool repeat;
};

// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h#L463
struct SdlMouseButtonEvent {
    uint32_t type;
    uint32_t reserved;
    uint64_t timestamp;
    SdlWindowId windowId;
    uint32_t which;
    uint8_t button;
    uint8_t down;
    uint8_t clicks;
    uint8_t padding;
    float x;
    float y;
};

// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h#L444
struct SdlMouseMotionEvent {
    uint32_t type;
    uint32_t reserved;
    uint64_t timestamp;
    SdlWindowId windowId;
    uint32_t which;
    uint32_t state;
    float x;
    float y;
    float xrel;
    float yrel;
};

// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h#L483
struct SdlMouseWheelEvent {
    uint32_t type;
    uint32_t reserved;
    uint64_t timestamp;
    SdlWindowId windowId;
    uint32_t which;
    float x;
    float y;
    uint32_t direction;
    float mouseX;
    float mouseY;
    int32_t integerX;
    int32_t integerY;
};

// https://github.com/libsdl-org/SDL/blob/release-3.2.x/include/SDL3/SDL_events.h#L988
union SdlEvent {
    uint32_t type;
    SdlMouseButtonEvent button;
    SdlMouseMotionEvent motion;
    SdlMouseWheelEvent wheel;
    SdlKeyboardEvent key;
    uint8_t padding[128];
};

typedef bool (*SdlEventFilter)(void* userData, SdlEvent* event);
typedef void (*SdlSetEventFilterFn)(SdlEventFilter filter, void* userData);
typedef bool (*SdlGetEventFilterFn)(SdlEventFilter* filter, void** userData);
typedef void* (*SdlGetWindowFromIdFn)(SdlWindowId id);
typedef bool (*SdlGetWindowRelativeMouseModeFn)(void* window);
typedef SdlKeycode (*SdlGetKeyFromScancodeFn)(SdlScancode scancode, SdlKeymod modstate, bool keyEvent);
typedef bool (*SdlShowSimpleMessageBoxFn)(uint32_t flags, const char* title, const char* message, void* window);
