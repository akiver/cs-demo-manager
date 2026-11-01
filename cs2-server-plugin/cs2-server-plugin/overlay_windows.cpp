#include <d3d11.h>
#include <dxgi1_2.h>
#include <windows.h>
#include <windowsx.h>

#include <atomic>
#include <cfloat>
#include <mutex>
#include <string>
#include <variant>
#include <vector>

#include "buttons_overlay.h"
#include "imgui.h"
#include "imgui_impl_dx11.h"
#include "imgui_impl_win32.h"
#include "log.h"
#include "maths.h"
#include "overlay.h"
#include "playback_overlay.h"
#include "plugin.h"
#include "ui/overlay_font.h"
#include "ui/overlay_toasts.h"
#include "ui/playback_panel.h"
#include "voice_indicator.h"
#include "vtable.h"

static void InstallWindowProcedureHook();
static void RemoveWindowProcedureHook();

// IDXGISwapChain inherits IUnknown (3 methods), IDXGIObject (4) and IDXGIDeviceSubObject (1), so its own methods
// start at 8, Present first. Inheritance chain and method order from the interface reference:
// https://learn.microsoft.com/en-us/windows/win32/api/dxgi/nn-dxgi-idxgiswapchain
constexpr int presentVtableIndex = 8;

typedef HRESULT(STDMETHODCALLTYPE* PresentFn)(IDXGISwapChain* swapChain, UINT syncInterval, UINT flags);

static void** swapChainVTable = NULL;
static PresentFn originalPresent = NULL;

// IDXGIFactory2 inherits IUnknown (3 methods), IDXGIObject (4), IDXGIFactory (5) and IDXGIFactory1 (2).
// CreateSwapChain is the 4th method of IDXGIFactory and CreateSwapChainForHwnd the 2nd of IDXGIFactory2. Both are
// hooked for the Steam overlay, see SuspendPresentHook.
// https://learn.microsoft.com/en-us/windows/win32/api/dxgi1_2/nn-dxgi1_2-idxgifactory2
constexpr int createSwapChainVtableIndex = 10;
constexpr int createSwapChainForHwndVtableIndex = 15;

typedef HRESULT(STDMETHODCALLTYPE* CreateSwapChainFn)(IDXGIFactory* factory, IUnknown* device,
                                                      DXGI_SWAP_CHAIN_DESC* description, IDXGISwapChain** swapChain);
typedef HRESULT(STDMETHODCALLTYPE* CreateSwapChainForHwndFn)(
    IDXGIFactory2* factory, IUnknown* device, HWND window, const DXGI_SWAP_CHAIN_DESC1* description,
    const DXGI_SWAP_CHAIN_FULLSCREEN_DESC* fullscreenDescription, IDXGIOutput* restrictToOutput,
    IDXGISwapChain1** swapChain);

static void** factoryVTable = NULL;
static CreateSwapChainFn originalCreateSwapChain = NULL;
static CreateSwapChainForHwndFn originalCreateSwapChainForHwnd = NULL;
static ID3D11Device* device = NULL;
static ID3D11DeviceContext* deviceContext = NULL;
static HWND gameWindow = NULL;
static bool isImGuiInitialized = false;

struct MouseButtonEvent {
    ImGuiMouseButton button;
    bool isDown;
};

struct KeyEvent {
    ImGuiKey key;
    bool isDown;
};

// A UTF-16 code unit, characters outside the BMP (characters above U+FFFF, like emoji) arrive as two WM_CHAR messages.
struct CharacterEvent {
    unsigned short character;
};

struct FocusLostEvent {};

using InputEvent = std::variant<MouseButtonEvent, KeyEvent, CharacterEvent, FocusLostEvent>;

template <class... Handlers>
struct InputEventVisitor : Handlers... {
    using Handlers::operator()...;
};
template <class... Handlers>
InputEventVisitor(Handlers...) -> InputEventVisitor<Handlers...>;

// ImGui frames are built on the render thread while input arrives in the window procedure, on the game's main thread.
// ImGui's input queue isn't thread safe, so input is queued here and handed to ImGui by the render thread before each
// frame. The mutex is only held to push or swap: during a resize the main thread holds Direct3D locks the render thread
// may be waiting on while it sends messages to its own window, so a lock held across a frame would deadlock the game.
static std::mutex inputEventQueueMutex;
static std::vector<InputEvent> pendingInputEvents;
// Whether ImGui wanted the mouse on the last frame: the cursor is over an ImGui panel, or a press on one is still held.
// Written by the render thread, read by the window procedure, which can't wait for a frame to decide what the game
// gets.
static std::atomic<bool> imguiWantsMouse{false};
// Whether a field of a panel was being typed in on the last frame, the keyboard is then kept from the game.
static std::atomic<bool> imguiWantsTextInput{false};
// A press the panel took is kept from the game up to its release, even if the cursor left the panel in between.
static bool isPressCaptured = false;

// Created for each frame and released right after it. A view holds a reference on the back buffer, and the game can't
// resize or recreate its swap chain while anything references one: a view kept across frames would break every resize
// path the overlay doesn't hook. Creating one per frame is cheap.
static ID3D11RenderTargetView* CreateRenderTarget(IDXGISwapChain* swapChain) {
    ID3D11Texture2D* backBuffer = NULL;
    if (FAILED(swapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (void**)&backBuffer)) || backBuffer == NULL) {
        return NULL;
    }

    ID3D11RenderTargetView* renderTargetView = NULL;
    device->CreateRenderTargetView(backBuffer, NULL, &renderTargetView);
    backBuffer->Release();

    return renderTargetView;
}

static bool InitializeImGui(IDXGISwapChain* swapChain) {
    if (isImGuiInitialized) {
        return true;
    }

    if (FAILED(swapChain->GetDevice(__uuidof(ID3D11Device), (void**)&device)) || device == NULL) {
        Log("Overlay: the swap chain isn't a Direct3D 11 one, not drawing");
        return false;
    }

    device->GetImmediateContext(&deviceContext);

    DXGI_SWAP_CHAIN_DESC description;
    if (FAILED(swapChain->GetDesc(&description))) {
        Log("Overlay: swap chain description not available");
        // Release the references taken above, the next Present retries.
        deviceContext->Release();
        deviceContext = NULL;
        device->Release();
        device = NULL;
        return false;
    }

    gameWindow = description.OutputWindow;
    InstallWindowProcedureHook();

    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO();
    // The backend polls the cursor position and NewWindowProcedure feeds the clicks. The game hides the cursor while
    // the mouse drives the camera, so ImGui must never change or hide it.
    io.ConfigFlags |= ImGuiConfigFlags_NoMouseCursorChange;
    // Don't write imgui.ini/imgui_log.txt next to the game executable.
    io.IniFilename = NULL;
    io.LogFilename = NULL;
    if (!LoadOverlayFont(gameDirectory.c_str())) {
        Log("Overlay: the font of the game can't be read, names written in another script than Latin will be drawn as "
            "question marks");
    }
    ImGui::StyleColorsDark();

    ImGui_ImplWin32_Init(description.OutputWindow);
    ImGui_ImplDX11_Init(device, deviceContext);
    isImGuiInitialized = true;
    Log("Overlay initialized");

    return true;
}

bool OverlayIsCursorVisible() {
    CURSORINFO cursorInfo = {};
    cursorInfo.cbSize = sizeof(cursorInfo);

    return GetCursorInfo(&cursorInfo) && (cursorInfo.flags & CURSOR_SHOWING) != 0;
}

bool OverlayGetCursorPositionInWindow(float* x, float* y) {
    if (!OverlayIsCursorVisible() || gameWindow == NULL || GetForegroundWindow() != gameWindow) {
        return false;
    }

    POINT point;
    if (!GetCursorPos(&point) || !ScreenToClient(gameWindow, &point)) {
        return false;
    }

    *x = (float)point.x;
    *y = (float)point.y;

    return true;
}

static bool IsMouseOnAnyPanel() { return ButtonsOverlayIsMouseBusy() || (OverlayIsCursorVisible() && imguiWantsMouse); }

static void QueueInputEvent(const InputEvent& event) {
    std::lock_guard<std::mutex> lock(inputEventQueueMutex);
    pendingInputEvents.push_back(event);
}

static void FeedMouseButton(ImGuiMouseButton button, bool isDown) { QueueInputEvent(MouseButtonEvent{button, isDown}); }

// Not static in the ImGui backend so that code feeding its own key events can use it, but not in its header.
ImGuiKey ImGui_ImplWin32_KeyEventToImGuiKey(WPARAM wParam, LPARAM lParam);

static void FeedKey(WPARAM parameter, LPARAM longParameter, bool isDown) {
    ImGuiKey key = ImGui_ImplWin32_KeyEventToImGuiKey(parameter, longParameter);
    if (key != ImGuiKey_None) {
        QueueInputEvent(KeyEvent{key, isDown});
    }
}

static void FeedCharacter(WPARAM parameter) { QueueInputEvent(CharacterEvent{(unsigned short)parameter}); }

// Hands ImGui the input queued since the previous frame. Render thread only.
static void DrainInputEvents() {
    std::vector<InputEvent> events;
    {
        std::lock_guard<std::mutex> lock(inputEventQueueMutex);
        events.swap(pendingInputEvents);
    }

    ImGuiIO& io = ImGui::GetIO();
    const auto visitor = InputEventVisitor{
        [&io](const MouseButtonEvent& event) { io.AddMouseButtonEvent(event.button, event.isDown); },
        [&io](const KeyEvent& event) { io.AddKeyEvent(event.key, event.isDown); },
        [&io](const CharacterEvent& event) { io.AddInputCharacterUTF16(event.character); },
        [&io](const FocusLostEvent&) { io.AddFocusEvent(false); },
    };
    for (const InputEvent& event : events) {
        std::visit(visitor, event);
    }
}

static bool IsKeyboardRawInput(LPARAM longParameter) {
    RAWINPUTHEADER header;
    UINT size = sizeof(header);
    if (GetRawInputData((HRAWINPUT)longParameter, RID_HEADER, &header, &size, sizeof(RAWINPUTHEADER)) == (UINT)-1) {
        return false;
    }

    return header.dwType == RIM_TYPEKEYBOARD;
}

static WNDPROC originalWindowProcedure = NULL;

// Mouse input over a panel is kept from the game, otherwise clicking a panel also triggers whatever the click is bound
// to, like switching to the next player. Raw input is swallowed too since that's how the game reads the mouse.
static LRESULT CALLBACK NewWindowProcedure(HWND window, UINT message, WPARAM parameter, LPARAM longParameter) {
    if (IsAnyPanelVisible()) {
        switch (message) {
            case WM_LBUTTONDOWN:
            case WM_LBUTTONDBLCLK: {
                if (!OverlayIsCursorVisible()) {
                    break;
                }

                float x = (float)GET_X_LPARAM(longParameter);
                float y = (float)GET_Y_LPARAM(longParameter);
                if (ButtonsOverlayHandleMouseDown(x, y)) {
                    return 0;
                }

                FeedMouseButton(ImGuiMouseButton_Left, true);
                if (imguiWantsMouse) {
                    isPressCaptured = true;
                    return 0;
                }
                break;
            }

            case WM_MOUSEMOVE: {
                float x = (float)GET_X_LPARAM(longParameter);
                float y = (float)GET_Y_LPARAM(longParameter);
                bool isLeftButtonHeld = (parameter & MK_LBUTTON) != 0;
                if (ButtonsOverlayHandleMouseMove(x, y, isLeftButtonHeld)) {
                    return 0;
                }

                // The position itself is polled by the ImGui backend at every frame.
                if (OverlayIsCursorVisible() && imguiWantsMouse) {
                    return 0;
                }
                break;
            }

            case WM_LBUTTONUP: {
                float x = (float)GET_X_LPARAM(longParameter);
                float y = (float)GET_Y_LPARAM(longParameter);
                if (ButtonsOverlayHandleMouseUp(x, y)) {
                    return 0;
                }

                FeedMouseButton(ImGuiMouseButton_Left, false);
                if (isPressCaptured) {
                    isPressCaptured = false;
                    return 0;
                }
                break;
            }

            case WM_KILLFOCUS: {
                ButtonsOverlayCancelDrag();
                FeedMouseButton(ImGuiMouseButton_Left, false);
                FeedMouseButton(ImGuiMouseButton_Right, false);
                isPressCaptured = false;
                QueueInputEvent(FocusLostEvent{});
                break;
            }

            case WM_KEYDOWN:
            case WM_KEYUP:
                FeedKey(parameter, longParameter, message == WM_KEYDOWN);
                if (imguiWantsTextInput) {
                    return 0;
                }
                break;

            case WM_CHAR:
                FeedCharacter(parameter);
                if (imguiWantsTextInput) {
                    return 0;
                }
                break;

            case WM_RBUTTONDOWN:
            case WM_RBUTTONDBLCLK:
            case WM_RBUTTONUP: {
                bool isDown = message != WM_RBUTTONUP;
                if (!isDown || OverlayIsCursorVisible()) {
                    FeedMouseButton(ImGuiMouseButton_Right, isDown);
                }
                if (IsMouseOnAnyPanel()) {
                    return 0;
                }
                break;
            }

            case WM_MBUTTONDOWN:
            case WM_MBUTTONUP:
            case WM_MBUTTONDBLCLK:
            case WM_MOUSEWHEEL:
                if (IsMouseOnAnyPanel()) {
                    return 0;
                }
                break;

            case WM_INPUT:
                // Raw input has to go through DefWindowProc for the system to clean it up:
                // https://learn.microsoft.com/en-us/windows/win32/inputdev/wm-input
                if (IsMouseOnAnyPanel() || (imguiWantsTextInput && IsKeyboardRawInput(longParameter))) {
                    return DefWindowProcW(window, message, parameter, longParameter);
                }
                break;
        }
    } else if (isPressCaptured) {
        // The panels were hidden mid-press. The game gets the release, so the capture ends here.
        isPressCaptured = false;
        FeedMouseButton(ImGuiMouseButton_Left, false);
    }

    return CallWindowProcW(originalWindowProcedure, window, message, parameter, longParameter);
}

static void InstallWindowProcedureHook() {
    if (originalWindowProcedure != NULL || gameWindow == NULL) {
        return;
    }

    originalWindowProcedure = (WNDPROC)SetWindowLongPtrW(gameWindow, GWLP_WNDPROC, (LONG_PTR)&NewWindowProcedure);
    if (originalWindowProcedure == NULL) {
        Log("Overlay: window procedure hook failed: %lu, the panels can't be clicked", GetLastError());
    }
}

static void RemoveWindowProcedureHook() {
    if (originalWindowProcedure == NULL) {
        return;
    }

    // When another hook was installed after ours, restoring the original procedure would cut that hook out of the
    // chain, so ours is left in place.
    if ((WNDPROC)GetWindowLongPtrW(gameWindow, GWLP_WNDPROC) == &NewWindowProcedure) {
        SetWindowLongPtrW(gameWindow, GWLP_WNDPROC, (LONG_PTR)originalWindowProcedure);
        originalWindowProcedure = NULL;
    } else {
        Log("Overlay: the window procedure has been hooked by something else, ours is left in place");
    }
}

// Runs on the render thread.
static void DrawOverlay(IDXGISwapChain* swapChain) {
    if (!InitializeImGui(swapChain)) {
        return;
    }

    DrainInputEvents();
    ImGui_ImplDX11_NewFrame();
    ImGui_ImplWin32_NewFrame();
    // The backend reports the cursor position even while the cursor is hidden, which is when the mouse drives the
    // camera, so ImGui is told the mouse left.
    if (!OverlayIsCursorVisible() || GetForegroundWindow() != gameWindow) {
        ImGui::GetIO().AddMousePosEvent(-FLT_MAX, -FLT_MAX);
    }
    ImGui::NewFrame();
    imguiWantsMouse = ImGui::GetIO().WantCaptureMouse;
    imguiWantsTextInput = ImGui::GetIO().WantTextInput;

    ImVec2 displaySize = ImGui::GetIO().DisplaySize;
    ButtonsOverlayDrawFrame(displaySize.x, displaySize.y);
    PlaybackOverlayDrawFrame();
    VoiceIndicatorDrawFrame();
    ImVec2 playbackPanelPosition;
    ImVec2 playbackPanelSize;
    bool hasPlaybackPanel = GetPlaybackPanelRect(&playbackPanelPosition, &playbackPanelSize);
    DrawOverlayToasts(GetOverlayBackgroundOpacity(), GetOverlayScale(), hasPlaybackPanel, playbackPanelPosition,
                      playbackPanelSize);

    ImGui::Render();

    ID3D11RenderTargetView* renderTargetView = CreateRenderTarget(swapChain);
    if (renderTargetView == NULL) {
        return;
    }

    ID3D11RenderTargetView* previousRenderTarget = NULL;
    ID3D11DepthStencilView* previousDepthStencil = NULL;
    deviceContext->OMGetRenderTargets(1, &previousRenderTarget, &previousDepthStencil);
    deviceContext->OMSetRenderTargets(1, &renderTargetView, NULL);
    ImGui_ImplDX11_RenderDrawData(ImGui::GetDrawData());
    deviceContext->OMSetRenderTargets(1, &previousRenderTarget, previousDepthStencil);
    if (previousRenderTarget != NULL) {
        previousRenderTarget->Release();
    }
    if (previousDepthStencil != NULL) {
        previousDepthStencil->Release();
    }
    renderTargetView->Release();
}

static HRESULT STDMETHODCALLTYPE NewPresent(IDXGISwapChain* swapChain, UINT syncInterval, UINT flags) {
    if (IsAnyPanelVisible()) {
        DrawOverlay(swapChain);
    } else {
        // Nothing is drawn, so nothing can be hovered or typed in.
        imguiWantsMouse = false;
        imguiWantsTextInput = false;
    }

    return originalPresent(swapChain, syncInterval, flags);
}

// The Steam overlay hooks the creation functions and patches whatever function the Present slot of each new swap chain
// points to. If our hook were in the slot, it would patch NewPresent and treat it as dxgi's Present, and the two hooks
// would call each other until the stack overflows (a resolution change creates a new swap chain). The slot is given
// back to dxgi while a swap chain is created, so the Steam overlay finds the function it already hooked. A frame
// presented in between is drawn without the panels.
// Returns whether the hook was suspended. A failure leaves it in place, which only matters with the Steam overlay on.
static bool SuspendPresentHook() {
    if (swapChainVTable == NULL || originalPresent == NULL) {
        return false;
    }

    if (!PatchVTableEntry(swapChainVTable, presentVtableIndex, (void*)originalPresent)) {
        Log("Overlay: suspending the Present hook failed, the swap chain creation may crash the game with the Steam "
            "overlay on");
        return false;
    }

    return true;
}

// A failure leaves dxgi's Present in the slot: the panels are not drawn until the next swap chain creation puts the
// hook back.
static void ResumePresentHook() {
    if (!PatchVTableEntry(swapChainVTable, presentVtableIndex, (void*)&NewPresent)) {
        Log("Overlay: resuming the Present hook failed, the overlay is off until the next swap chain creation");
    }
}

static HRESULT STDMETHODCALLTYPE NewCreateSwapChain(IDXGIFactory* factory, IUnknown* device,
                                                    DXGI_SWAP_CHAIN_DESC* description, IDXGISwapChain** swapChain) {
    bool suspended = SuspendPresentHook();
    HRESULT result = originalCreateSwapChain(factory, device, description, swapChain);
    if (suspended) {
        ResumePresentHook();
    }

    return result;
}

static HRESULT STDMETHODCALLTYPE NewCreateSwapChainForHwnd(IDXGIFactory2* factory, IUnknown* device, HWND window,
                                                           const DXGI_SWAP_CHAIN_DESC1* description,
                                                           const DXGI_SWAP_CHAIN_FULLSCREEN_DESC* fullscreenDescription,
                                                           IDXGIOutput* restrictToOutput, IDXGISwapChain1** swapChain) {
    bool suspended = SuspendPresentHook();
    HRESULT result = originalCreateSwapChainForHwnd(factory, device, window, description, fullscreenDescription,
                                                    restrictToOutput, swapChain);
    if (suspended) {
        ResumePresentHook();
    }

    return result;
}

// Like the swap chain vtable, the factory vtable is shared by every factory of the process, so a throwaway factory
// gives the table the game's factory uses.
static void** GetFactoryVTable() {
    IDXGIFactory2* factory = NULL;
    if (FAILED(CreateDXGIFactory1(__uuidof(IDXGIFactory2), (void**)&factory)) || factory == NULL) {
        Log("Overlay: temporary DXGI factory creation failed, a resolution change will crash the game with the Steam "
            "overlay on");
        return NULL;
    }

    void** vtable = *(void***)factory;
    factory->Release();

    return vtable;
}

static void InstallFactoryHooks() {
    factoryVTable = GetFactoryVTable();
    if (factoryVTable == NULL) {
        return;
    }

    originalCreateSwapChain = (CreateSwapChainFn)factoryVTable[createSwapChainVtableIndex];
    if (!PatchVTableEntry(factoryVTable, createSwapChainVtableIndex, (void*)&NewCreateSwapChain)) {
        originalCreateSwapChain = NULL;
        Log("Overlay: hooking CreateSwapChain failed, a resolution change may crash the game with the Steam overlay "
            "on");
    }
    originalCreateSwapChainForHwnd = (CreateSwapChainForHwndFn)factoryVTable[createSwapChainForHwndVtableIndex];
    if (!PatchVTableEntry(factoryVTable, createSwapChainForHwndVtableIndex, (void*)&NewCreateSwapChainForHwnd)) {
        originalCreateSwapChainForHwnd = NULL;
        Log("Overlay: hooking CreateSwapChainForHwnd failed, a resolution change may crash the game with the Steam "
            "overlay on");
    }
}

static void RemoveFactoryHooks() {
    if (factoryVTable == NULL) {
        return;
    }

    if (originalCreateSwapChain != NULL &&
        !PatchVTableEntry(factoryVTable, createSwapChainVtableIndex, (void*)originalCreateSwapChain)) {
        Log("Overlay: removing the CreateSwapChain hook failed");
    }
    if (originalCreateSwapChainForHwnd != NULL &&
        !PatchVTableEntry(factoryVTable, createSwapChainForHwndVtableIndex, (void*)originalCreateSwapChainForHwnd)) {
        Log("Overlay: removing the CreateSwapChainForHwnd hook failed");
    }
    factoryVTable = NULL;
    originalCreateSwapChain = NULL;
    originalCreateSwapChainForHwnd = NULL;
}

// The vtable of IDXGISwapChain lives in dxgi.dll and is shared by every swap chain of the process, so hooking the one
// of a throwaway swap chain also hooks the one the game renders through, no signature scanning required.
static void** GetSwapChainVTable() {
    HWND window =
        CreateWindowExA(0, "STATIC", "csdm", WS_OVERLAPPED, 0, 0, 2, 2, NULL, NULL, GetModuleHandleA(NULL), NULL);
    if (window == NULL) {
        Log("Overlay: temporary window creation failed: %lu", GetLastError());
        return NULL;
    }

    DXGI_SWAP_CHAIN_DESC description = {};
    description.BufferCount = 1;
    description.BufferDesc.Width = 2;
    description.BufferDesc.Height = 2;
    description.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    description.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    description.OutputWindow = window;
    description.SampleDesc.Count = 1;
    description.Windowed = TRUE;
    description.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

    D3D_FEATURE_LEVEL featureLevel = D3D_FEATURE_LEVEL_11_0;
    IDXGISwapChain* swapChain = NULL;
    ID3D11Device* temporaryDevice = NULL;
    ID3D11DeviceContext* temporaryContext = NULL;
    HRESULT result =
        D3D11CreateDeviceAndSwapChain(NULL, D3D_DRIVER_TYPE_HARDWARE, NULL, 0, &featureLevel, 1, D3D11_SDK_VERSION,
                                      &description, &swapChain, &temporaryDevice, NULL, &temporaryContext);

    void** vtable = NULL;
    if (SUCCEEDED(result) && swapChain != NULL) {
        vtable = *(void***)swapChain;
    } else {
        Log("Overlay: temporary swap chain creation failed: %#lx", result);
    }

    if (temporaryContext != NULL) {
        temporaryContext->Release();
    }
    if (swapChain != NULL) {
        swapChain->Release();
    }
    if (temporaryDevice != NULL) {
        temporaryDevice->Release();
    }
    DestroyWindow(window);

    return vtable;
}

void InstallOverlay() {
    if (originalPresent != NULL) {
        return;
    }

    if (GetModuleHandleA("rendersystemvulkan.dll") != NULL) {
        Log("Overlay: the game renders with Vulkan, only Direct3D 11 is supported");
        return;
    }

    swapChainVTable = GetSwapChainVTable();
    if (swapChainVTable == NULL) {
        return;
    }

    originalPresent = (PresentFn)swapChainVTable[presentVtableIndex];
    if (!PatchVTableEntry(swapChainVTable, presentVtableIndex, (void*)&NewPresent)) {
        originalPresent = NULL;
        swapChainVTable = NULL;
        Log("Overlay: hooking Present failed, the overlay is off");
        return;
    }
    InstallFactoryHooks();
    Log("Overlay hooks installed");
}

void RemoveOverlay() {
    SetButtonsOverlayVisible(false);
    SetPlaybackPanelVisible(false);
    SetVoiceIndicatorVisible(false);
    ButtonsOverlayCancelDrag();
    RemoveWindowProcedureHook();

    if (swapChainVTable == NULL) {
        return;
    }

    RemoveFactoryHooks();
    if (!PatchVTableEntry(swapChainVTable, presentVtableIndex, (void*)originalPresent)) {
        Log("Overlay: removing the Present hook failed");
    }
    swapChainVTable = NULL;
    originalPresent = NULL;
}

bool IsAnyPanelVisible() {
    return IsButtonsOverlayVisible() || IsPlaybackPanelVisible() || IsVoiceIndicatorDrawn() || HasOverlayToasts();
}

void ShowOverlayToast(const char* text) { QueueOverlayToast(text); }

static std::atomic<float> backgroundOpacity{overlayDefaultBackgroundOpacity};

void SetOverlayBackgroundOpacity(float opacity) { backgroundOpacity = ClampToRange(opacity, 0.f, 1.f); }

float GetOverlayBackgroundOpacity() { return backgroundOpacity; }

static std::atomic<float> overlayScale{overlayDefaultScale};

void SetOverlayScale(float scale) { overlayScale = ClampToRange(scale, overlayMinScale, overlayMaxScale); }

float GetOverlayScale() { return overlayScale; }

static std::atomic<bool> areTooltipsEnabled{true};

void SetOverlayTooltipsEnabled(bool isEnabled) { areTooltipsEnabled = isEnabled; }

bool AreOverlayTooltipsEnabled() { return areTooltipsEnabled; }
