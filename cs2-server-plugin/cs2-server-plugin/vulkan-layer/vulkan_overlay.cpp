#include "vulkan_overlay.h"

#include <atomic>
#include <cfloat>
#include <chrono>
#include <cstdio>
#include <cstring>
#include <mutex>
#include <variant>
#include <vector>

#include "../ui/buttons_panel.h"
#include "../ui/overlay_font.h"
#include "../ui/overlay_toasts.h"
#include "../ui/playback_panel.h"
#include "../ui/voice_indicator_panel.h"
#include "imgui.h"
#include "imgui_impl_vulkan.h"
#include "log.h"

static char gameDirectory[1024] = {};
static std::atomic<bool> hasGameDirectory{false};

// State pushed by the plugin, read by the render thread at every frame.
static std::atomic<bool> isOverlayVisible{false};
static std::atomic<uint64_t> pressedButtons{0};
static std::atomic<float> spectatedPlayerSpeed{0.f};
// The buttons panel's right middle point as fractions of the display size.
static std::atomic<float> panelFractionX{buttonsOverlayDefaultFractionX};
static std::atomic<float> panelFractionY{buttonsOverlayDefaultFractionY};

static std::atomic<bool> isPanelHighlighted{false};

// Where the panel was last drawn, in display (swapchain) pixels, published by the render thread so the plugin can
// hit-test mouse events. Unlike on Windows, the plugin can't compute this itself: only the layer knows the display
// size.
static std::atomic<bool> hasPanelRect{false};
static std::atomic<float> panelRectX{0.f};
static std::atomic<float> panelRectY{0.f};
static std::atomic<float> panelRectWidth{0.f};
static std::atomic<float> panelRectHeight{0.f};
static std::atomic<float> panelDisplayWidth{0.f};
static std::atomic<float> panelDisplayHeight{0.f};

// Playback panel state.
static std::atomic<bool> isPlaybackPanelVisible{false};
static std::atomic<float> backgroundOpacity{overlayDefaultBackgroundOpacity};
static std::atomic<float> overlayScale{overlayDefaultScale};
static std::atomic<bool> areTooltipsEnabled{true};
static std::atomic<int> playbackTick{0};
static std::atomic<int> playbackTotalTicks{0};
static std::atomic<bool> isPlaybackPaused{false};
static std::atomic<bool> isPlaybackInProgress{false};
static std::atomic<float> playbackSpeed{1.f};
static std::atomic<bool> isPlaybackXrayEnabled{true};
static std::atomic<bool> playbackButtonsOverlayVisible{false};
static std::atomic<bool> playbackVoiceIndicatorVisible{false};
static std::atomic<bool> playbackMatchTimelineVisible{true};
static std::atomic<bool> playbackRoundTimelineVisible{true};
static std::atomic<bool> playbackRoundTimelineSpectatedOnly{false};
static std::atomic<bool> playbackFollowKillerEnabled{false};
static std::atomic<float> playbackAutoHideDelay{playbackPanelDefaultAutoHideDelay};
static std::atomic<int> playbackSkipSeconds{playbackDefaultSkipSeconds};
static std::atomic<uint64_t> playbackSpectatedSteamId{0};
static std::atomic<int> playbackSpectatedSlot{-1};
static std::atomic<uint64_t> playbackLockedSteamId{0};
static std::atomic<int> playbackLockedSlot{-1};
static std::atomic<int> playbackLoopStartTick{-1};
static std::atomic<int> playbackLoopEndTick{-1};
static std::atomic<int> playbackSequenceStartTick{-1};
static std::atomic<bool> playbackAppConnected{false};
static std::atomic<int> playbackRoundDurationSeconds{0};
static std::atomic<int> playbackBombTimerSeconds{0};
// Voice indicator state. The player list doesn't fit in an atomic, so a mutex guards it.
static std::atomic<bool> isVoiceIndicatorVisible{false};
static std::mutex voiceIndicatorMutex;
static VoiceIndicatorState voiceIndicatorState;
// Timeline of the seek bar.
static std::mutex playbackTimelineMutex;
static PlaybackTimeline playbackTimeline = {};
// Voice menu of the playback panel, behind a mutex for the same reason as the voice indicator.
static std::mutex playbackVoiceMutex;
static uint32_t playbackVoiceMaskLow = 0;
static uint32_t playbackVoiceMaskHigh = 0;
static int playbackPlayerCount = 0;
static PlaybackPlayer playbackPlayers[playbackMaxPlayers];
// Camera menu of the playback panel.
static std::mutex playbackCamerasMutex;
static int playbackCameraCount = 0;
static PlaybackCamera playbackCameras[playbackMaxCameras];
static int playbackCurrentCameraIndex = -1;
// Receives the user's actions on the playback panel. Called from the render thread.
static std::atomic<PlaybackActionCallback> playbackActionCallback{NULL};

struct MouseMoveEvent {
    float x;
    float y;
};

struct MouseButtonEvent {
    OverlayMouseButton button;
    bool isDown;
};

struct KeyEvent {
    OverlayKey key;
    bool isDown;
};

struct CharacterEvent {
    unsigned int character;
};

struct FocusLostEvent {};

using InputEvent = std::variant<MouseMoveEvent, MouseButtonEvent, KeyEvent, CharacterEvent, FocusLostEvent>;

template <class... Handlers>
struct InputEventVisitor : Handlers... {
    using Handlers::operator()...;
};
template <class... Handlers>
InputEventVisitor(Handlers...) -> InputEventVisitor<Handlers...>;

// Input events arrive on the SDL thread, but ImGui must only be used from the render thread. They wait here until the
// next frame. The lock is only held to push or swap, so the SDL thread never waits for a frame to finish.
static std::mutex inputEventQueueMutex;
static std::vector<InputEvent> pendingInputEvents;
static std::atomic<bool> imguiWantsMouse{false};
static std::atomic<bool> imguiWantsTextInput{false};

static ImGuiMouseButton ToImGuiMouseButton(OverlayMouseButton button) {
    return button == OVERLAY_MOUSE_BUTTON_RIGHT ? ImGuiMouseButton_Right : ImGuiMouseButton_Left;
}

static ImGuiKey ToImGuiKey(OverlayKey key) {
    switch (key) {
        case OVERLAY_KEY_ENTER:
            return ImGuiKey_Enter;
        case OVERLAY_KEY_ESCAPE:
            return ImGuiKey_Escape;
        case OVERLAY_KEY_BACKSPACE:
            return ImGuiKey_Backspace;
        case OVERLAY_KEY_DELETE:
            return ImGuiKey_Delete;
        case OVERLAY_KEY_LEFT:
            return ImGuiKey_LeftArrow;
        case OVERLAY_KEY_RIGHT:
            return ImGuiKey_RightArrow;
        case OVERLAY_KEY_HOME:
            return ImGuiKey_Home;
        case OVERLAY_KEY_END:
            return ImGuiKey_End;
    }

    return ImGuiKey_None;
}

static void DrainInputEvents() {
    std::vector<InputEvent> events;
    {
        std::lock_guard<std::mutex> lock(inputEventQueueMutex);
        events.swap(pendingInputEvents);
    }

    ImGuiIO& io = ImGui::GetIO();
    const auto visitor = InputEventVisitor{
        [&io](const MouseMoveEvent& event) { io.AddMousePosEvent(event.x, event.y); },
        [&io](const MouseButtonEvent& event) {
            io.AddMouseButtonEvent(ToImGuiMouseButton(event.button), event.isDown);
        },
        [&io](const KeyEvent& event) { io.AddKeyEvent(ToImGuiKey(event.key), event.isDown); },
        [&io](const CharacterEvent& event) { io.AddInputCharacter(event.character); },
        // Releases the keys and buttons held when the game lost the focus, their release will never arrive.
        [&io](const FocusLostEvent&) { io.AddFocusEvent(false); },
    };
    for (const InputEvent& event : events) {
        std::visit(visitor, event);
    }
}

static void QueueInputEvent(const InputEvent& event) {
    std::lock_guard<std::mutex> lock(inputEventQueueMutex);
    pendingInputEvents.push_back(event);
}

// One per swapchain image. The game may have several frames in flight, so none of this can be shared between images.
struct FrameResources {
    VkImageView imageView;
    VkFramebuffer framebuffer;
    VkCommandBuffer commandBuffer;
    // Signalled once the previous frame using this image has drawn its panel, so the command buffer can be recorded
    // again.
    VkFence fence;
    // Signalled when the panel is drawn, waited on by the present.
    VkSemaphore renderFinishedSemaphore;
};

struct SwapchainResources {
    VkSwapchainKHR swapchain;
    VkRenderPass renderPass;
    VkCommandPool commandPool;
    VkExtent2D extent;
    std::vector<FrameResources> frames;
};

// Guards everything below. Presents come from the render thread, swapchain and device destruction from the main thread.
static std::mutex overlayMutex;
static DeviceData* overlayDeviceData = NULL;
static SwapchainResources overlayResources = {};
static bool isImGuiContextCreated = false;
static bool isImGuiVulkanInitialized = false;
// A swapchain the resources couldn't be built for, remembered so it isn't attempted again at every frame.
static VkSwapchainKHR failedSwapchain = VK_NULL_HANDLE;
static std::chrono::steady_clock::time_point previousFrameTime;
static bool hasPreviousFrameTime = false;

bool IsOverlayVisible() {
    return (isOverlayVisible && isPlaybackInProgress) || isPlaybackPanelVisible || isVoiceIndicatorVisible;
}

// ImGui resolves its Vulkan functions through this, from the chain below the layer, so its own calls don't come back
// through the hooks installed here.
static PFN_vkVoidFunction LoadVulkanFunction(const char* name, void* userData) {
    DeviceData* data = (DeviceData*)userData;
    PFN_vkVoidFunction function = data->nextGetDeviceProcAddr(data->device, name);
    if (function == NULL) {
        function = data->nextGetInstanceProcAddr(data->instance, name);
    }

    return function;
}

static void DestroyResources() {
    DeviceData* data = overlayDeviceData;
    if (data == NULL) {
        return;
    }

    DeviceDispatch& dispatch = data->dispatch;
    dispatch.DeviceWaitIdle(data->device);

    if (isImGuiVulkanInitialized) {
        ImGui_ImplVulkan_Shutdown();
        isImGuiVulkanInitialized = false;
    }

    for (FrameResources& frame : overlayResources.frames) {
        if (frame.framebuffer != VK_NULL_HANDLE) {
            dispatch.DestroyFramebuffer(data->device, frame.framebuffer, NULL);
        }
        if (frame.imageView != VK_NULL_HANDLE) {
            dispatch.DestroyImageView(data->device, frame.imageView, NULL);
        }
        if (frame.fence != VK_NULL_HANDLE) {
            dispatch.DestroyFence(data->device, frame.fence, NULL);
        }
        if (frame.renderFinishedSemaphore != VK_NULL_HANDLE) {
            dispatch.DestroySemaphore(data->device, frame.renderFinishedSemaphore, NULL);
        }
    }

    if (overlayResources.commandPool != VK_NULL_HANDLE) {
        dispatch.DestroyCommandPool(data->device, overlayResources.commandPool, NULL);
    }
    if (overlayResources.renderPass != VK_NULL_HANDLE) {
        dispatch.DestroyRenderPass(data->device, overlayResources.renderPass, NULL);
    }

    overlayResources = SwapchainResources();
    overlayDeviceData = NULL;
    hasPreviousFrameTime = false;
}

static bool CreateRenderPass(DeviceData* data, VkFormat format) {
    VkAttachmentDescription attachment = {};
    attachment.format = format;
    attachment.samples = VK_SAMPLE_COUNT_1_BIT;
    attachment.loadOp = VK_ATTACHMENT_LOAD_OP_LOAD;
    attachment.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
    attachment.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
    attachment.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
    attachment.initialLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
    attachment.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

    VkAttachmentReference colorAttachment = {};
    colorAttachment.attachment = 0;
    colorAttachment.layout = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

    VkSubpassDescription subpass = {};
    subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = &colorAttachment;

    VkSubpassDependency dependency = {};
    dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
    dependency.dstSubpass = 0;
    dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
    dependency.srcAccessMask = 0;
    dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;

    VkRenderPassCreateInfo createInfo = {};
    createInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
    createInfo.attachmentCount = 1;
    createInfo.pAttachments = &attachment;
    createInfo.subpassCount = 1;
    createInfo.pSubpasses = &subpass;
    createInfo.dependencyCount = 1;
    createInfo.pDependencies = &dependency;

    return data->dispatch.CreateRenderPass(data->device, &createInfo, NULL, &overlayResources.renderPass) == VK_SUCCESS;
}

static bool CreateFrames(DeviceData* data, VkSwapchainKHR swapchain, const SwapchainInfo& info,
                         uint32_t queueFamilyIndex) {
    DeviceDispatch& dispatch = data->dispatch;

    uint32_t imageCount = 0;
    if (dispatch.GetSwapchainImagesKHR(data->device, swapchain, &imageCount, NULL) != VK_SUCCESS || imageCount == 0) {
        return false;
    }

    std::vector<VkImage> images(imageCount);
    if (dispatch.GetSwapchainImagesKHR(data->device, swapchain, &imageCount, images.data()) != VK_SUCCESS) {
        return false;
    }

    VkCommandPoolCreateInfo poolCreateInfo = {};
    poolCreateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO;
    poolCreateInfo.flags = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT;
    poolCreateInfo.queueFamilyIndex = queueFamilyIndex;
    if (dispatch.CreateCommandPool(data->device, &poolCreateInfo, NULL, &overlayResources.commandPool) != VK_SUCCESS) {
        return false;
    }

    std::vector<VkCommandBuffer> commandBuffers(imageCount);
    VkCommandBufferAllocateInfo commandBufferAllocateInfo = {};
    commandBufferAllocateInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    commandBufferAllocateInfo.commandPool = overlayResources.commandPool;
    commandBufferAllocateInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    commandBufferAllocateInfo.commandBufferCount = imageCount;
    if (dispatch.AllocateCommandBuffers(data->device, &commandBufferAllocateInfo, commandBuffers.data()) !=
        VK_SUCCESS) {
        return false;
    }

    overlayResources.frames.resize(imageCount);
    for (uint32_t i = 0; i < imageCount; i++) {
        FrameResources& frame = overlayResources.frames[i];
        frame = FrameResources();
        frame.commandBuffer = commandBuffers[i];

        VkImageViewCreateInfo imageViewCreateInfo = {};
        imageViewCreateInfo.sType = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
        imageViewCreateInfo.image = images[i];
        imageViewCreateInfo.viewType = VK_IMAGE_VIEW_TYPE_2D;
        imageViewCreateInfo.format = info.format;
        imageViewCreateInfo.subresourceRange.aspectMask = VK_IMAGE_ASPECT_COLOR_BIT;
        imageViewCreateInfo.subresourceRange.levelCount = 1;
        imageViewCreateInfo.subresourceRange.layerCount = 1;
        if (dispatch.CreateImageView(data->device, &imageViewCreateInfo, NULL, &frame.imageView) != VK_SUCCESS) {
            return false;
        }

        VkFramebufferCreateInfo framebufferCreateInfo = {};
        framebufferCreateInfo.sType = VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO;
        framebufferCreateInfo.renderPass = overlayResources.renderPass;
        framebufferCreateInfo.attachmentCount = 1;
        framebufferCreateInfo.pAttachments = &frame.imageView;
        framebufferCreateInfo.width = info.extent.width;
        framebufferCreateInfo.height = info.extent.height;
        framebufferCreateInfo.layers = 1;
        if (dispatch.CreateFramebuffer(data->device, &framebufferCreateInfo, NULL, &frame.framebuffer) != VK_SUCCESS) {
            return false;
        }

        // Created signalled: the first frame using this image has nothing to wait for.
        VkFenceCreateInfo fenceCreateInfo = {};
        fenceCreateInfo.sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO;
        fenceCreateInfo.flags = VK_FENCE_CREATE_SIGNALED_BIT;
        if (dispatch.CreateFence(data->device, &fenceCreateInfo, NULL, &frame.fence) != VK_SUCCESS) {
            return false;
        }

        VkSemaphoreCreateInfo semaphoreCreateInfo = {};
        semaphoreCreateInfo.sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO;
        if (dispatch.CreateSemaphore(data->device, &semaphoreCreateInfo, NULL, &frame.renderFinishedSemaphore) !=
            VK_SUCCESS) {
            return false;
        }
    }

    return true;
}

static void InitializeImGui(DeviceData* data, VkQueue queue, uint32_t queueFamilyIndex, const SwapchainInfo& info,
                            uint32_t imageCount) {
    if (!isImGuiContextCreated) {
        ImGui::CreateContext();
        ImGuiIO& io = ImGui::GetIO();
        // The plugin feeds the mouse and there is no platform backend to change the cursor.
        io.ConfigFlags |= ImGuiConfigFlags_NoMouseCursorChange;
        // Don't write imgui.ini/imgui_log.txt in the working directory of the game.
        io.IniFilename = NULL;
        io.LogFilename = NULL;
        io.DisplaySize = ImVec2((float)info.extent.width, (float)info.extent.height);
        ImGui::StyleColorsDark();
        isImGuiContextCreated = true;
    }

    ImGui_ImplVulkan_LoadFunctions(data->apiVersion, &LoadVulkanFunction, data);

    ImGui_ImplVulkan_InitInfo initInfo = {};
    initInfo.ApiVersion = data->apiVersion;
    initInfo.Instance = data->instance;
    initInfo.PhysicalDevice = data->physicalDevice;
    initInfo.Device = data->device;
    initInfo.QueueFamily = queueFamilyIndex;
    initInfo.Queue = queue;
    // Lets the backend create its own descriptor pool for the font atlas.
    initInfo.DescriptorPoolSize = IMGUI_IMPL_VULKAN_MINIMUM_SAMPLED_IMAGE_POOL_SIZE;
    initInfo.MinImageCount = info.minImageCount < 2 ? 2 : info.minImageCount;
    initInfo.ImageCount = imageCount < initInfo.MinImageCount ? initInfo.MinImageCount : imageCount;
    initInfo.PipelineInfoMain.RenderPass = overlayResources.renderPass;
    initInfo.PipelineInfoMain.Subpass = 0;
    initInfo.PipelineInfoMain.MSAASamples = VK_SAMPLE_COUNT_1_BIT;

    isImGuiVulkanInitialized = ImGui_ImplVulkan_Init(&initInfo);
}

static bool CreateResources(DeviceData* data, VkQueue queue, VkSwapchainKHR swapchain, const SwapchainInfo& info) {
    uint32_t queueFamilyIndex = 0;
    if (!FindQueueFamily(data, queue, &queueFamilyIndex)) {
        LayerLog("Overlay: the queue the game presents with is unknown, nothing will be drawn");
        return false;
    }

    overlayDeviceData = data;
    overlayResources.swapchain = swapchain;
    overlayResources.extent = info.extent;

    if (!CreateRenderPass(data, info.format)) {
        LayerLog("Overlay: render pass creation failed");
        return false;
    }

    if (!CreateFrames(data, swapchain, info, queueFamilyIndex)) {
        LayerLog("Overlay: swapchain resources creation failed");
        return false;
    }

    InitializeImGui(data, queue, queueFamilyIndex, info, (uint32_t)overlayResources.frames.size());
    if (!isImGuiVulkanInitialized) {
        LayerLog("Overlay: the ImGui Vulkan backend failed to initialize");
        return false;
    }

    LayerLog("Overlay initialized, %ux%u, %u images", info.extent.width, info.extent.height,
             (unsigned int)overlayResources.frames.size());

    return true;
}

static float GetDeltaTime() {
    auto now = std::chrono::steady_clock::now();
    float deltaTime = 1.f / 60.f;
    if (hasPreviousFrameTime) {
        deltaTime = std::chrono::duration<float>(now - previousFrameTime).count();
    }

    previousFrameTime = now;
    hasPreviousFrameTime = true;

    // ImGui wants a strictly positive delta, and a huge one after a stall throws its timers off.
    if (deltaTime <= 0.f || deltaTime > 1.f) {
        deltaTime = 1.f / 60.f;
    }

    return deltaTime;
}

// The font comes from the files of the game, which only the plugin knows the path of, and it can be pushed after the
// ImGui context has been created. So it is loaded on the first frame that has it, before anything is drawn.
static void LoadFontOnce() {
    static bool isFontLoaded = false;
    if (isFontLoaded || !hasGameDirectory) {
        return;
    }

    isFontLoaded = true;
    if (!LoadOverlayFont(gameDirectory)) {
        LayerLog(
            "Overlay: the font of the game can't be read, names written in another script than Latin will be drawn as "
            "question marks");
    }
}

static void BuildFrame(const SwapchainInfo& info) {
    LoadFontOnce();

    ImGuiIO& io = ImGui::GetIO();
    io.DisplaySize = ImVec2((float)info.extent.width, (float)info.extent.height);
    io.DeltaTime = GetDeltaTime();

    DrainInputEvents();
    ImGui_ImplVulkan_NewFrame();
    ImGui::NewFrame();
    imguiWantsMouse = io.WantCaptureMouse;
    imguiWantsTextInput = io.WantTextInput;

    if (isOverlayVisible && isPlaybackInProgress) {
        ButtonsPanelState state = {};
        state.buttons = pressedButtons;
        state.speed = spectatedPlayerSpeed;
        state.fractionX = panelFractionX;
        state.fractionY = panelFractionY;
        state.isHighlighted = isPanelHighlighted;
        state.backgroundOpacity = backgroundOpacity;
        state.scale = overlayScale;
        ButtonsPanelLayout layout = DrawButtonsPanel(state, io.DisplaySize);

        panelRectX = layout.position.x;
        panelRectY = layout.position.y;
        panelRectWidth = layout.size.x;
        panelRectHeight = layout.size.y;
        panelDisplayWidth = io.DisplaySize.x;
        panelDisplayHeight = io.DisplaySize.y;
        hasPanelRect = true;
    } else {
        // Stops the plugin's input hook from hit-testing a hidden panel.
        panelRectWidth = 0.f;
    }

    if (isPlaybackPanelVisible) {
        PlaybackPanelState state = {};
        state.isPlaying = isPlaybackInProgress;
        state.tick = playbackTick;
        state.totalTicks = playbackTotalTicks;
        state.isPaused = isPlaybackPaused;
        state.speed = playbackSpeed;
        state.isXrayEnabled = isPlaybackXrayEnabled;
        state.isButtonsOverlayVisible = playbackButtonsOverlayVisible;
        state.isVoiceIndicatorVisible = playbackVoiceIndicatorVisible;
        state.isMatchTimelineVisible = playbackMatchTimelineVisible;
        state.isRoundTimelineVisible = playbackRoundTimelineVisible;
        state.isRoundTimelineSpectatedOnly = playbackRoundTimelineSpectatedOnly;
        state.isFollowKillerEnabled = playbackFollowKillerEnabled;
        state.backgroundOpacity = backgroundOpacity;
        state.scale = overlayScale;
        state.areTooltipsEnabled = areTooltipsEnabled;
        state.autoHideDelay = playbackAutoHideDelay;
        state.skipSeconds = playbackSkipSeconds;
        state.spectatedSteamId = playbackSpectatedSteamId;
        state.spectatedSlot = playbackSpectatedSlot;
        state.lockedSteamId = playbackLockedSteamId;
        state.lockedSlot = playbackLockedSlot;
        state.loopStartTick = playbackLoopStartTick;
        state.loopEndTick = playbackLoopEndTick;
        state.sequenceStartTick = playbackSequenceStartTick;
        state.isAppConnected = playbackAppConnected;
        state.roundDurationSeconds = playbackRoundDurationSeconds;
        state.bombTimerSeconds = playbackBombTimerSeconds;
        {
            std::lock_guard<std::mutex> lock(playbackVoiceMutex);
            state.voiceMaskLow = playbackVoiceMaskLow;
            state.voiceMaskHigh = playbackVoiceMaskHigh;
            state.playerCount = playbackPlayerCount;
            memcpy(state.players, playbackPlayers, sizeof(PlaybackPlayer) * playbackPlayerCount);
        }
        {
            std::lock_guard<std::mutex> lock(playbackCamerasMutex);
            state.cameraCount = playbackCameraCount;
            memcpy(state.cameras, playbackCameras, sizeof(PlaybackCamera) * playbackCameraCount);
            state.currentCameraIndex = playbackCurrentCameraIndex;
        }

        PlaybackPanelActions actions;
        {
            std::lock_guard<std::mutex> lock(playbackTimelineMutex);
            actions = DrawPlaybackPanel(state, playbackTimeline);
        }
        PlaybackActionCallback callback = playbackActionCallback;
        if (callback != NULL) {
            for (int i = 0; i < actions.count; i++) {
                callback(&actions.actions[i]);
            }
        }
    }

    if (isVoiceIndicatorVisible) {
        VoiceIndicatorState state;
        {
            std::lock_guard<std::mutex> lock(voiceIndicatorMutex);
            state = voiceIndicatorState;
        }
        DrawVoiceIndicatorPanel(state, backgroundOpacity, overlayScale);
    }

    ImVec2 playbackPanelPosition;
    ImVec2 playbackPanelSize;
    bool hasPlaybackPanel = GetPlaybackPanelRect(&playbackPanelPosition, &playbackPanelSize);
    DrawOverlayToasts(backgroundOpacity, overlayScale, hasPlaybackPanel, playbackPanelPosition, playbackPanelSize);
    ImGui::Render();
}

// Stops drawing over that swapchain until the game builds another one, which it does whenever the resolution or the
// display mode changes. Callers must hold overlayMutex.
static void GiveUpOnSwapchain(VkSwapchainKHR swapchain) {
    DestroyResources();
    failedSwapchain = swapchain;
    LayerLog("Overlay: drawing the panel failed, it won't be drawn again until the swapchain is built again");
}

bool OverlayRender(DeviceData* data, VkQueue queue, VkSwapchainKHR swapchain, const SwapchainInfo& info,
                   uint32_t imageIndex, uint32_t waitSemaphoreCount, const VkSemaphore* waitSemaphores,
                   VkSemaphore* renderFinishedSemaphore) {
    std::lock_guard<std::mutex> lock(overlayMutex);

    if (swapchain == failedSwapchain) {
        return false;
    }

    // The game presenting to another swapchain means the one the resources were built for is gone, or is about to be.
    if (overlayResources.swapchain != swapchain) {
        DestroyResources();
        if (!CreateResources(data, queue, swapchain, info)) {
            DestroyResources();
            failedSwapchain = swapchain;
            return false;
        }
    }

    if (imageIndex >= overlayResources.frames.size()) {
        return false;
    }

    DeviceDispatch& dispatch = data->dispatch;
    FrameResources& frame = overlayResources.frames[imageIndex];

    if (dispatch.WaitForFences(data->device, 1, &frame.fence, VK_TRUE, UINT64_MAX) != VK_SUCCESS ||
        dispatch.ResetFences(data->device, 1, &frame.fence) != VK_SUCCESS) {
        GiveUpOnSwapchain(swapchain);

        return false;
    }

    // From here on the frame's fence is unsignalled and only the submission below signals it again. Any failure must
    // give up on the swapchain instead of returning, or the next frame drawn with this image would wait forever.
    BuildFrame(info);

    VkCommandBufferBeginInfo beginInfo = {};
    beginInfo.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;
    beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;
    if (dispatch.ResetCommandBuffer(frame.commandBuffer, 0) != VK_SUCCESS ||
        dispatch.BeginCommandBuffer(frame.commandBuffer, &beginInfo) != VK_SUCCESS) {
        GiveUpOnSwapchain(swapchain);

        return false;
    }

    VkRenderPassBeginInfo renderPassBeginInfo = {};
    renderPassBeginInfo.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
    renderPassBeginInfo.renderPass = overlayResources.renderPass;
    renderPassBeginInfo.framebuffer = frame.framebuffer;
    renderPassBeginInfo.renderArea.extent = overlayResources.extent;
    dispatch.CmdBeginRenderPass(frame.commandBuffer, &renderPassBeginInfo, VK_SUBPASS_CONTENTS_INLINE);
    ImGui_ImplVulkan_RenderDrawData(ImGui::GetDrawData(), frame.commandBuffer);
    dispatch.CmdEndRenderPass(frame.commandBuffer);

    if (dispatch.EndCommandBuffer(frame.commandBuffer) != VK_SUCCESS) {
        GiveUpOnSwapchain(swapchain);

        return false;
    }

    // Waiting on the semaphores the present was going to wait on draws the panel once the game's frame is rendered.
    std::vector<VkPipelineStageFlags> waitStages(waitSemaphoreCount, VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT);
    VkSubmitInfo submitInfo = {};
    submitInfo.sType = VK_STRUCTURE_TYPE_SUBMIT_INFO;
    submitInfo.waitSemaphoreCount = waitSemaphoreCount;
    submitInfo.pWaitSemaphores = waitSemaphores;
    submitInfo.pWaitDstStageMask = waitStages.data();
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = &frame.commandBuffer;
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = &frame.renderFinishedSemaphore;
    if (dispatch.QueueSubmit(queue, 1, &submitInfo, frame.fence) != VK_SUCCESS) {
        GiveUpOnSwapchain(swapchain);

        return false;
    }

    *renderFinishedSemaphore = frame.renderFinishedSemaphore;

    return true;
}

void OverlayReleaseSwapchain(DeviceData* data, VkSwapchainKHR swapchain) {
    std::lock_guard<std::mutex> lock(overlayMutex);

    if (failedSwapchain == swapchain) {
        failedSwapchain = VK_NULL_HANDLE;
    }

    if (overlayDeviceData == data && overlayResources.swapchain == swapchain) {
        DestroyResources();
    }
}

void OverlayReleaseDevice(DeviceData* data) {
    std::lock_guard<std::mutex> lock(overlayMutex);

    if (overlayDeviceData == data) {
        DestroyResources();
        failedSwapchain = VK_NULL_HANDLE;
    }
}

extern "C" {

// Called by the plugin to push state into the layer. The render thread reads what they write.

CSDM_LAYER_EXPORT void CsdmOverlaySetGameDirectory(const char* directory) {
    if (directory == NULL || hasGameDirectory) {
        return;
    }

    snprintf(gameDirectory, sizeof(gameDirectory), "%s", directory);
    hasGameDirectory = true;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetVisible(int isVisible) { isOverlayVisible = isVisible != 0; }

CSDM_LAYER_EXPORT void CsdmOverlaySetPressedButtons(uint64_t buttons) { pressedButtons = buttons; }

CSDM_LAYER_EXPORT void CsdmOverlaySetSpeed(float speed) { spectatedPlayerSpeed = speed; }

CSDM_LAYER_EXPORT void CsdmOverlaySetPosition(float fractionX, float fractionY) {
    panelFractionX = fractionX;
    panelFractionY = fractionY;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetHighlighted(int isHighlighted) { isPanelHighlighted = isHighlighted != 0; }

// Gives the plugin the buttons panel rectangle and the display size it was computed against, in display pixels.
// Returns 0 until the panel has been drawn once.
CSDM_LAYER_EXPORT int CsdmOverlayGetPanelRect(float* x, float* y, float* width, float* height, float* displayWidth,
                                              float* displayHeight) {
    if (!hasPanelRect) {
        return 0;
    }

    *x = panelRectX;
    *y = panelRectY;
    *width = panelRectWidth;
    *height = panelRectHeight;
    *displayWidth = panelDisplayWidth;
    *displayHeight = panelDisplayHeight;

    return 1;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackVisible(int isVisible) { isPlaybackPanelVisible = isVisible != 0; }

// ImGui owns the playback panel position since the user drags it with ImGui, so these two go to the panel directly.
CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackPosition(float fractionX, float fractionY) {
    MovePlaybackPanelTo(fractionX, fractionY);
}

// Gives the plugin the panel's bottom center as a fraction of the display size.
CSDM_LAYER_EXPORT int CsdmOverlayGetPlaybackPosition(float* fractionX, float* fractionY) {
    if (fractionX == NULL || fractionY == NULL) {
        return 0;
    }

    GetPlaybackPanelPlacement(fractionX, fractionY);

    return 1;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetVoiceIndicatorPosition(float fractionX, float fractionY) {
    MoveVoiceIndicatorPanelTo(fractionX, fractionY);
}

CSDM_LAYER_EXPORT int CsdmOverlayGetVoiceIndicatorPosition(float* fractionX, float* fractionY) {
    if (fractionX == NULL || fractionY == NULL) {
        return 0;
    }

    GetVoiceIndicatorPanelPlacement(fractionX, fractionY);

    return 1;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackState(const OverlayPlaybackState* state) {
    if (state == NULL) {
        return;
    }

    isPlaybackInProgress = state->isPlaying;
    playbackTick = state->tick;
    playbackTotalTicks = state->totalTicks;
    isPlaybackPaused = state->isPaused;
    playbackSpeed = state->speed;
    isPlaybackXrayEnabled = state->isXrayEnabled;
    playbackButtonsOverlayVisible = state->isButtonsOverlayVisible;
    playbackVoiceIndicatorVisible = state->isVoiceIndicatorVisible;
    playbackMatchTimelineVisible = state->isMatchTimelineVisible;
    playbackRoundTimelineVisible = state->isRoundTimelineVisible;
    playbackRoundTimelineSpectatedOnly = state->isRoundTimelineSpectatedOnly;
    playbackFollowKillerEnabled = state->isFollowKillerEnabled;
    playbackAutoHideDelay = state->autoHideDelay;
    playbackSkipSeconds = state->skipSeconds;
    playbackSpectatedSteamId = state->spectatedSteamId;
    playbackSpectatedSlot = state->spectatedSlot;
    playbackLockedSteamId = state->lockedSteamId;
    playbackLockedSlot = state->lockedSlot;
    playbackLoopStartTick = state->loopStartTick;
    playbackLoopEndTick = state->loopEndTick;
    playbackSequenceStartTick = state->sequenceStartTick;
    playbackAppConnected = state->isAppConnected;
    playbackRoundDurationSeconds = state->roundDurationSeconds;
    playbackBombTimerSeconds = state->bombTimerSeconds;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetVoiceIndicator(int isVisible, int playerCount,
                                                    const VoiceIndicatorPlayer* players) {
    if (playerCount < 0 || players == NULL) {
        playerCount = 0;
    } else if (playerCount > voiceIndicatorMaxPlayers) {
        playerCount = voiceIndicatorMaxPlayers;
    }

    {
        std::lock_guard<std::mutex> lock(voiceIndicatorMutex);
        voiceIndicatorState.playerCount = playerCount;
        if (playerCount > 0) {
            memcpy(voiceIndicatorState.players, players, sizeof(VoiceIndicatorPlayer) * playerCount);
        }
    }
    isVoiceIndicatorVisible = isVisible != 0 && playerCount > 0;
}

CSDM_LAYER_EXPORT void CsdmOverlayShowToast(const char* text) { QueueOverlayToast(text); }

// Also called from the render thread, when a checkbox of the voice menu is clicked.
CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackVoice(uint32_t maskLow, uint32_t maskHigh, int playerCount,
                                                   const PlaybackPlayer* players) {
    if (playerCount < 0 || players == NULL) {
        playerCount = 0;
    } else if (playerCount > playbackMaxPlayers) {
        playerCount = playbackMaxPlayers;
    }

    std::lock_guard<std::mutex> lock(playbackVoiceMutex);
    playbackVoiceMaskLow = maskLow;
    playbackVoiceMaskHigh = maskHigh;
    playbackPlayerCount = playerCount;
    if (playerCount > 0) {
        memcpy(playbackPlayers, players, sizeof(PlaybackPlayer) * playerCount);
    }
}

// Sets the receiver of the user's actions on the playback panel, NULL to stop. It runs on the render thread while the
// frame is built.
CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackActionCallback(PlaybackActionCallback callback) {
    playbackActionCallback = callback;
}

CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackTimeline(const OverlayPlaybackTimeline* timeline) {
    std::lock_guard<std::mutex> lock(playbackTimelineMutex);
    playbackTimeline = PlaybackTimeline{};
    if (timeline == NULL) {
        return;
    }

    playbackTimeline.roundDurationSeconds = timeline->roundDurationSeconds;
    if (timeline->roundCount > 0 && timeline->rounds != NULL) {
        playbackTimeline.rounds.assign(timeline->rounds, timeline->rounds + timeline->roundCount);
    }
    if (timeline->killCount > 0 && timeline->kills != NULL) {
        playbackTimeline.kills.assign(timeline->kills, timeline->kills + timeline->killCount);
    }
    if (timeline->bombPlantCount > 0 && timeline->bombPlants != NULL) {
        playbackTimeline.bombPlants.assign(timeline->bombPlants, timeline->bombPlants + timeline->bombPlantCount);
    }
    if (timeline->bombDefuseCount > 0 && timeline->bombDefuses != NULL) {
        playbackTimeline.bombDefuses.assign(timeline->bombDefuses, timeline->bombDefuses + timeline->bombDefuseCount);
    }
    if (timeline->bombExplosionCount > 0 && timeline->bombExplosions != NULL) {
        playbackTimeline.bombExplosions.assign(timeline->bombExplosions,
                                               timeline->bombExplosions + timeline->bombExplosionCount);
    }
    if (timeline->highlightCount > 0 && timeline->highlights != NULL) {
        playbackTimeline.highlights.assign(timeline->highlights, timeline->highlights + timeline->highlightCount);
    }
    if (timeline->lowlightCount > 0 && timeline->lowlights != NULL) {
        playbackTimeline.lowlights.assign(timeline->lowlights, timeline->lowlights + timeline->lowlightCount);
    }
}

// Also called from the render thread, when a camera of the menu is clicked.
CSDM_LAYER_EXPORT void CsdmOverlaySetPlaybackCameras(int cameraCount, const PlaybackCamera* cameras, int currentIndex) {
    if (cameraCount < 0 || cameras == NULL) {
        cameraCount = 0;
    } else if (cameraCount > playbackMaxCameras) {
        cameraCount = playbackMaxCameras;
    }

    std::lock_guard<std::mutex> lock(playbackCamerasMutex);
    playbackCameraCount = cameraCount;
    playbackCurrentCameraIndex = currentIndex;
    if (cameraCount > 0) {
        memcpy(playbackCameras, cameras, sizeof(PlaybackCamera) * cameraCount);
    }
}

CSDM_LAYER_EXPORT void CsdmOverlayMouseMove(float x, float y) { QueueInputEvent(MouseMoveEvent{x, y}); }

CSDM_LAYER_EXPORT void CsdmOverlayMouseLeave() { CsdmOverlayMouseMove(-FLT_MAX, -FLT_MAX); }

CSDM_LAYER_EXPORT void CsdmOverlaySetBackgroundOpacity(float opacity) { backgroundOpacity = opacity; }

CSDM_LAYER_EXPORT void CsdmOverlaySetScale(float scale) { overlayScale = scale; }

CSDM_LAYER_EXPORT void CsdmOverlaySetTooltipsEnabled(int isEnabled) { areTooltipsEnabled = isEnabled != 0; }

CSDM_LAYER_EXPORT void CsdmOverlayMouseButton(int button, int isDown) {
    QueueInputEvent(MouseButtonEvent{(OverlayMouseButton)button, isDown != 0});
}

// `key` is an OverlayKey.
CSDM_LAYER_EXPORT void CsdmOverlayKey(int key, int isDown) { QueueInputEvent(KeyEvent{(OverlayKey)key, isDown != 0}); }

// A typed character, as a Unicode code point.
CSDM_LAYER_EXPORT void CsdmOverlayCharacter(unsigned int character) { QueueInputEvent(CharacterEvent{character}); }

CSDM_LAYER_EXPORT void CsdmOverlayFocusLost() { QueueInputEvent(FocusLostEvent{}); }

// Whether ImGui wanted the mouse on the last frame (cursor over the playback panel, or a press on it still held), in
// which case the plugin keeps the mouse events from the game.
CSDM_LAYER_EXPORT int CsdmOverlayWantsMouse() { return isPlaybackPanelVisible && imguiWantsMouse ? 1 : 0; }

// Whether a text field of the playback panel was being typed in on the last frame, in which case the plugin keeps the
// keyboard events from the game.
CSDM_LAYER_EXPORT int CsdmOverlayWantsKeyboard() { return isPlaybackPanelVisible && imguiWantsTextInput ? 1 : 0; }
}
