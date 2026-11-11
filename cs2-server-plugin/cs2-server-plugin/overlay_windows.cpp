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
static void InstallCaptureHook();

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
// HLAE is injected when the game starts, before the overlay is initialized.
static bool isHlaeLoaded = false;

// ID3D11DeviceContext inherits IUnknown (3 methods) and ID3D11DeviceChild (4), Map is its 8th method.
// https://learn.microsoft.com/en-us/windows/win32/api/d3d11/nn-d3d11-id3d11devicecontext
constexpr int mapVtableIndex = 14;

typedef HRESULT(STDMETHODCALLTYPE* MapFn)(ID3D11DeviceContext* context, ID3D11Resource* resource, UINT subresource,
                                          D3D11_MAP type, UINT flags, D3D11_MAPPED_SUBRESOURCE* mappedResource);

static void** deviceContextVTable = NULL;
static MapFn originalMap = NULL;
// The thread calling Present, the only one the panels are built and drawn on.
static std::atomic<DWORD> renderThreadId{0};
static UINT backBufferWidth = 0;
static UINT backBufferHeight = 0;
// Whether the ImGui frame of the frame being rendered is built, by Present or by a frame capture before it.
static bool isOverlayFrameBuilt = false;
static std::atomic<bool> arePanelsDrawnInCaptures{true};
// A copy of the captured frame the panels are drawn into, see NewMap.
static ID3D11Texture2D* captureTarget = NULL;
static ID3D11RenderTargetView* captureTargetView = NULL;

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
    isHlaeLoaded = GetModuleHandleA("AfxHookSource2.dll") != NULL;
    if (!isHlaeLoaded) {
        InstallCaptureHook();
    }
    isImGuiInitialized = true;
    Log(isHlaeLoaded ? "Overlay initialized, HLAE detected" : "Overlay initialized");

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

static ID3D11Texture2D* GetViewTexture(ID3D11RenderTargetView* view) {
    ID3D11Resource* resource = NULL;
    view->GetResource(&resource);
    if (resource == NULL) {
        return NULL;
    }

    ID3D11Texture2D* texture = NULL;
    if (FAILED(resource->QueryInterface(__uuidof(ID3D11Texture2D), (void**)&texture))) {
        texture = NULL;
    }
    resource->Release();

    return texture;
}

// The game draws each frame, HUD included, into a render target of its own, multisampled, and copies it into the back
// buffer, which is what the target still bound when Present is called is. HLAE records videos from that render target,
// not from the back buffer, after Present (by the game or by HLAE itself at the start of the next frame), so the panels
// are drawn into it too to be in the videos. The game redraws it entirely at every frame and HLAE copies it into the
// back buffer, so the panels don't show twice on screen.
static bool IsGameFrameTarget(ID3D11RenderTargetView* target, ID3D11RenderTargetView* backBufferView) {
    if (target == NULL) {
        return false;
    }

    ID3D11Texture2D* targetTexture = GetViewTexture(target);
    if (targetTexture == NULL) {
        return false;
    }
    ID3D11Texture2D* backBuffer = GetViewTexture(backBufferView);
    if (backBuffer == NULL) {
        targetTexture->Release();
        return false;
    }

    D3D11_TEXTURE2D_DESC targetDescription;
    targetTexture->GetDesc(&targetDescription);
    D3D11_TEXTURE2D_DESC backBufferDescription;
    backBuffer->GetDesc(&backBufferDescription);
    bool isGameFrameTarget = targetTexture != backBuffer && targetDescription.Width == backBufferDescription.Width &&
                             targetDescription.Height == backBufferDescription.Height;
    targetTexture->Release();
    backBuffer->Release();

    return isGameFrameTarget;
}

// Runs on the render thread, once per frame: when the game captures the frame or when it presents it, whichever comes
// first.
static void BuildOverlayFrame() {
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
    isOverlayFrameBuilt = true;
}

// Draws the panels of the built frame into the target, and leaves the render targets of the game bound as they were.
static void RenderOverlayInto(ID3D11RenderTargetView* target) {
    ID3D11RenderTargetView* previousTargets[D3D11_SIMULTANEOUS_RENDER_TARGET_COUNT] = {};
    ID3D11DepthStencilView* previousDepthStencil = NULL;
    deviceContext->OMGetRenderTargets(D3D11_SIMULTANEOUS_RENDER_TARGET_COUNT, previousTargets, &previousDepthStencil);
    deviceContext->OMSetRenderTargets(1, &target, NULL);
    ImGui_ImplDX11_RenderDrawData(ImGui::GetDrawData());
    deviceContext->OMSetRenderTargets(D3D11_SIMULTANEOUS_RENDER_TARGET_COUNT, previousTargets, previousDepthStencil);
    for (ID3D11RenderTargetView* previousTarget : previousTargets) {
        if (previousTarget != NULL) {
            previousTarget->Release();
        }
    }
    if (previousDepthStencil != NULL) {
        previousDepthStencil->Release();
    }
}

// Runs on the render thread.
static void DrawOverlay(IDXGISwapChain* swapChain) {
    if (!InitializeImGui(swapChain)) {
        return;
    }

    DXGI_SWAP_CHAIN_DESC description;
    if (SUCCEEDED(swapChain->GetDesc(&description))) {
        backBufferWidth = description.BufferDesc.Width;
        backBufferHeight = description.BufferDesc.Height;
    }

    if (!isOverlayFrameBuilt) {
        BuildOverlayFrame();
    }

    ID3D11RenderTargetView* renderTargetView = CreateRenderTarget(swapChain);
    if (renderTargetView == NULL) {
        return;
    }

    RenderOverlayInto(renderTargetView);
    if (isHlaeLoaded) {
        ID3D11RenderTargetView* gameTarget = NULL;
        deviceContext->OMGetRenderTargets(1, &gameTarget, NULL);
        if (IsGameFrameTarget(gameTarget, renderTargetView)) {
            RenderOverlayInto(gameTarget);
        }
        if (gameTarget != NULL) {
            gameTarget->Release();
        }
    }
    renderTargetView->Release();
}

static HRESULT STDMETHODCALLTYPE NewPresent(IDXGISwapChain* swapChain, UINT syncInterval, UINT flags) {
    renderThreadId = GetCurrentThreadId();
    if (IsAnyPanelVisible()) {
        DrawOverlay(swapChain);
    } else {
        // Nothing is drawn, so nothing can be hovered or typed in.
        imguiWantsMouse = false;
        imguiWantsTextInput = false;
    }
    isOverlayFrameBuilt = false;

    return originalPresent(swapChain, syncInterval, flags);
}

static bool IsRgba8Format(DXGI_FORMAT format) {
    return format == DXGI_FORMAT_R8G8B8A8_TYPELESS || format == DXGI_FORMAT_R8G8B8A8_UNORM ||
           format == DXGI_FORMAT_R8G8B8A8_UNORM_SRGB;
}

// Whether the resource looks like the copy of the frame the game maps for movies and screenshots, see NewMap.
// It's a CPU-readable staging texture the size of the screen.
static bool IsFrameCapture(ID3D11Resource* resource) {
    D3D11_RESOURCE_DIMENSION dimension;
    resource->GetType(&dimension);
    if (dimension != D3D11_RESOURCE_DIMENSION_TEXTURE2D) {
        return false;
    }

    D3D11_TEXTURE2D_DESC description;
    static_cast<ID3D11Texture2D*>(resource)->GetDesc(&description);

    return description.Usage == D3D11_USAGE_STAGING && (description.CPUAccessFlags & D3D11_CPU_ACCESS_READ) != 0 &&
           description.Width == backBufferWidth && description.Height == backBufferHeight &&
           description.MipLevels == 1 && description.ArraySize == 1 && description.SampleDesc.Count == 1 &&
           IsRgba8Format(description.Format);
}

// Kept across frames, unlike the view of the back buffer, since the swap chain doesn't own it.
static bool PrepareCaptureTarget(UINT width, UINT height) {
    if (captureTarget != NULL) {
        D3D11_TEXTURE2D_DESC description;
        captureTarget->GetDesc(&description);
        if (description.Width == width && description.Height == height) {
            return true;
        }
        captureTargetView->Release();
        captureTargetView = NULL;
        captureTarget->Release();
        captureTarget = NULL;
    }

    D3D11_TEXTURE2D_DESC description = {};
    description.Width = width;
    description.Height = height;
    description.MipLevels = 1;
    description.ArraySize = 1;
    // Typeless to be copyable from and to every RGBA8 format.
    description.Format = DXGI_FORMAT_R8G8B8A8_TYPELESS;
    description.SampleDesc.Count = 1;
    description.Usage = D3D11_USAGE_DEFAULT;
    description.BindFlags = D3D11_BIND_RENDER_TARGET;
    if (FAILED(device->CreateTexture2D(&description, NULL, &captureTarget)) || captureTarget == NULL) {
        captureTarget = NULL;
        Log("Overlay: the texture to draw the panels in the captured frames can't be created");
        return false;
    }

    // The bytes the panels write in the back buffer, which has a UNORM view, see CreateRenderTarget.
    D3D11_RENDER_TARGET_VIEW_DESC viewDescription = {};
    viewDescription.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    viewDescription.ViewDimension = D3D11_RTV_DIMENSION_TEXTURE2D;
    if (FAILED(device->CreateRenderTargetView(captureTarget, &viewDescription, &captureTargetView)) ||
        captureTargetView == NULL) {
        captureTargetView = NULL;
        captureTarget->Release();
        captureTarget = NULL;
        Log("Overlay: the view to draw the panels in the captured frames can't be created");
        return false;
    }

    return true;
}

static void DrawOverlayIntoCapture(ID3D11Texture2D* capture) {
    D3D11_TEXTURE2D_DESC description;
    capture->GetDesc(&description);
    if (!PrepareCaptureTarget(description.Width, description.Height)) {
        return;
    }

    if (!isOverlayFrameBuilt) {
        BuildOverlayFrame();
    }
    // A staging texture can't be a render target, so the panels are drawn on a copy that replaces it.
    deviceContext->CopyResource(captureTarget, capture);
    RenderOverlayInto(captureTargetView);
    deviceContext->CopyResource(capture, captureTarget);
}

// The game takes screenshots (startmovie) by copying the frame, HUD included, into a staging texture that it maps right
// away, before the frame is composited into the back buffer and presented. The panels, drawn when Present is called,
// would never be in the movies, so they are drawn into that texture just before the game reads it.
// The copy is recorded on a deferred context, only the Map is done on the immediate one.
// Not installed when HLAE is loaded, which records from the game's frame render target, see IsGameFrameTarget.
static HRESULT STDMETHODCALLTYPE NewMap(ID3D11DeviceContext* context, ID3D11Resource* resource, UINT subresource,
                                        D3D11_MAP type, UINT flags, D3D11_MAPPED_SUBRESOURCE* mappedResource) {
    if (type == D3D11_MAP_READ && context == deviceContext && arePanelsDrawnInCaptures &&
        GetCurrentThreadId() == renderThreadId && IsAnyPanelVisible() && IsFrameCapture(resource)) {
        DrawOverlayIntoCapture(static_cast<ID3D11Texture2D*>(resource));
    }

    return originalMap(context, resource, subresource, type, flags, mappedResource);
}

// Map is hooked by patching the vtable of the game's immediate context. The vtable lives in d3d11.dll and is shared by
// every immediate context of the process, but the game's is the only one, so the hook only sees the game's calls.
static void InstallCaptureHook() {
    if (originalMap != NULL) {
        return;
    }

    deviceContextVTable = *(void***)deviceContext;
    originalMap = (MapFn)deviceContextVTable[mapVtableIndex];
    if (!PatchVTableEntry(deviceContextVTable, mapVtableIndex, (void*)&NewMap)) {
        deviceContextVTable = NULL;
        originalMap = NULL;
        Log("Overlay: hooking Map failed, the panels won't be in the movies recorded by the game");
    }
}

static void RemoveCaptureHook() {
    if (deviceContextVTable == NULL) {
        return;
    }

    if (!PatchVTableEntry(deviceContextVTable, mapVtableIndex, (void*)originalMap)) {
        Log("Overlay: removing the Map hook failed");
        return;
    }
    deviceContextVTable = NULL;
    originalMap = NULL;
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

// The factory that created the adapter of the device, the one a swap chain for that device must be created with.
static IDXGIFactory2* GetDeviceFactory(ID3D11Device* device) {
    IDXGIDevice* dxgiDevice = NULL;
    if (FAILED(device->QueryInterface(__uuidof(IDXGIDevice), (void**)&dxgiDevice)) || dxgiDevice == NULL) {
        return NULL;
    }

    IDXGIAdapter* adapter = NULL;
    HRESULT result = dxgiDevice->GetAdapter(&adapter);
    dxgiDevice->Release();
    if (FAILED(result) || adapter == NULL) {
        return NULL;
    }

    IDXGIFactory2* factory = NULL;
    result = adapter->GetParent(__uuidof(IDXGIFactory2), (void**)&factory);
    adapter->Release();
    if (FAILED(result)) {
        return NULL;
    }

    return factory;
}

// The vtable of IDXGISwapChain lives in dxgi.dll and is shared by every swap chain of the process, so hooking the one
// of a throwaway swap chain also hooks the one the game renders through, no signature scanning required.
// The swap chain is created with CreateSwapChainForHwnd, never with CreateSwapChain or D3D11CreateDeviceAndSwapChain
// (which calls CreateSwapChain): HLAE hooks CreateSwapChain and keeps a pointer, without a reference, to the last swap
// chain created through it, which it uses to record videos and in its CreateRenderTargetView hook. A throwaway swap
// chain going through it left HLAE with a dangling pointer that crashed the game at the first panel drawn. HLAE also
// hooks D3D11CreateDevice, but only keeps the vtables of the device and its context, shared by every device.
static void** GetSwapChainVTable() {
    HWND window =
        CreateWindowExA(0, "STATIC", "csdm", WS_OVERLAPPED, 0, 0, 2, 2, NULL, NULL, GetModuleHandleA(NULL), NULL);
    if (window == NULL) {
        Log("Overlay: temporary window creation failed: %lu", GetLastError());
        return NULL;
    }

    D3D_FEATURE_LEVEL featureLevel = D3D_FEATURE_LEVEL_11_0;
    ID3D11Device* temporaryDevice = NULL;
    HRESULT result = D3D11CreateDevice(NULL, D3D_DRIVER_TYPE_HARDWARE, NULL, 0, &featureLevel, 1, D3D11_SDK_VERSION,
                                       &temporaryDevice, NULL, NULL);
    if (FAILED(result) || temporaryDevice == NULL) {
        Log("Overlay: temporary device creation failed: %#lx", result);
        DestroyWindow(window);
        return NULL;
    }

    IDXGIFactory2* factory = GetDeviceFactory(temporaryDevice);
    if (factory == NULL) {
        Log("Overlay: the DXGI factory of the temporary device isn't available");
        temporaryDevice->Release();
        DestroyWindow(window);
        return NULL;
    }

    DXGI_SWAP_CHAIN_DESC1 description = {};
    description.Width = 2;
    description.Height = 2;
    description.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    description.SampleDesc.Count = 1;
    description.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    description.BufferCount = 1;
    description.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

    IDXGISwapChain1* swapChain = NULL;
    result = factory->CreateSwapChainForHwnd(temporaryDevice, window, &description, NULL, NULL, &swapChain);

    void** vtable = NULL;
    if (SUCCEEDED(result) && swapChain != NULL) {
        vtable = *(void***)swapChain;
    } else {
        Log("Overlay: temporary swap chain creation failed: %#lx", result);
    }

    if (swapChain != NULL) {
        swapChain->Release();
    }
    factory->Release();
    temporaryDevice->Release();
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
    RemoveCaptureHook();

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

void SetOverlayDrawnInCaptures(bool isDrawn) { arePanelsDrawnInCaptures = isDrawn; }

static std::atomic<float> backgroundOpacity{overlayDefaultBackgroundOpacity};

void SetOverlayBackgroundOpacity(float opacity) { backgroundOpacity = ClampToRange(opacity, 0.f, 1.f); }

float GetOverlayBackgroundOpacity() { return backgroundOpacity; }

static std::atomic<float> overlayScale{overlayDefaultScale};

void SetOverlayScale(float scale) { overlayScale = ClampToRange(scale, overlayMinScale, overlayMaxScale); }

float GetOverlayScale() { return overlayScale; }

static std::atomic<bool> areTooltipsEnabled{true};

void SetOverlayTooltipsEnabled(bool isEnabled) { areTooltipsEnabled = isEnabled; }

bool AreOverlayTooltipsEnabled() { return areTooltipsEnabled; }
