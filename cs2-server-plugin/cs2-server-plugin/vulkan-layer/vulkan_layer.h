#pragma once

#include <vulkan/vk_layer.h>
#include <vulkan/vulkan.h>

#include <cstdint>
#include <map>

// The library is built with -fvisibility=hidden, only what the loader and the plugin look up is exported.
// VK_LAYER_EXPORT from vk_layer.h isn't used because its definition varies across Vulkan header versions.
#define CSDM_LAYER_EXPORT __attribute__((visibility("default")))

// The loader stores the dispatch table pointer at the start of every dispatchable object, so a device and its queues
// share the same key, which lets vkQueuePresentKHR find the device of its queue.
#define VK_DISPATCH_KEY(object) (*(void**)(object))

// Functions the layer calls itself, taken from the next layer in the chain so they never loop back into this one.
// ImGui resolves its own through the same chain, see LoadVulkanFunction in vulkan_overlay.cpp.
struct InstanceDispatch {
    PFN_vkGetInstanceProcAddr GetInstanceProcAddr;
    PFN_vkDestroyInstance DestroyInstance;
};

struct DeviceDispatch {
    PFN_vkGetDeviceProcAddr GetDeviceProcAddr;
    PFN_vkDestroyDevice DestroyDevice;
    PFN_vkGetDeviceQueue GetDeviceQueue;
    PFN_vkGetDeviceQueue2 GetDeviceQueue2;
    PFN_vkDeviceWaitIdle DeviceWaitIdle;
    PFN_vkQueueSubmit QueueSubmit;
    PFN_vkCreateSwapchainKHR CreateSwapchainKHR;
    PFN_vkDestroySwapchainKHR DestroySwapchainKHR;
    PFN_vkGetSwapchainImagesKHR GetSwapchainImagesKHR;
    PFN_vkQueuePresentKHR QueuePresentKHR;
    PFN_vkCreateImageView CreateImageView;
    PFN_vkDestroyImageView DestroyImageView;
    PFN_vkCreateRenderPass CreateRenderPass;
    PFN_vkDestroyRenderPass DestroyRenderPass;
    PFN_vkCreateFramebuffer CreateFramebuffer;
    PFN_vkDestroyFramebuffer DestroyFramebuffer;
    PFN_vkCreateCommandPool CreateCommandPool;
    PFN_vkDestroyCommandPool DestroyCommandPool;
    PFN_vkAllocateCommandBuffers AllocateCommandBuffers;
    PFN_vkBeginCommandBuffer BeginCommandBuffer;
    PFN_vkEndCommandBuffer EndCommandBuffer;
    PFN_vkResetCommandBuffer ResetCommandBuffer;
    PFN_vkCmdBeginRenderPass CmdBeginRenderPass;
    PFN_vkCmdEndRenderPass CmdEndRenderPass;
    PFN_vkCreateFence CreateFence;
    PFN_vkDestroyFence DestroyFence;
    PFN_vkWaitForFences WaitForFences;
    PFN_vkResetFences ResetFences;
    PFN_vkCreateSemaphore CreateSemaphore;
    PFN_vkDestroySemaphore DestroySemaphore;
};

// What a swapchain was created with, kept because vkQueuePresentKHR only hands out its handle and an image index.
struct SwapchainInfo {
    VkFormat format;
    VkExtent2D extent;
    uint32_t minImageCount;
};

struct DeviceData {
    VkInstance instance;
    VkPhysicalDevice physicalDevice;
    VkDevice device;
    uint32_t apiVersion;
    DeviceDispatch dispatch;
    // The chain below ours, handed to ImGui so its own Vulkan calls skip this layer too.
    PFN_vkGetInstanceProcAddr nextGetInstanceProcAddr;
    PFN_vkGetDeviceProcAddr nextGetDeviceProcAddr;
    // Filled when the game fetches its queues.
    std::map<VkQueue, uint32_t> queueFamilyByQueue;
    std::map<VkSwapchainKHR, SwapchainInfo> swapchainInfos;
};

// Locks the layer mutex, the game may fetch a queue while another thread presents.
bool FindQueueFamily(DeviceData* data, VkQueue queue, uint32_t* queueFamilyIndex);
