#pragma once

#include "vulkan_layer.h"

bool IsOverlayVisible();

// Draws the panels over the swapchain image the game is about to present, on the queue it presents with. The
// submission waits on the present's semaphores and signals `renderFinishedSemaphore`, which the present must wait on
// instead. Returns false when nothing was drawn, in which case the present must be forwarded untouched.
bool OverlayRender(DeviceData* deviceData, VkQueue queue, VkSwapchainKHR swapchain, const SwapchainInfo& info,
                   uint32_t imageIndex, uint32_t waitSemaphoreCount, const VkSemaphore* waitSemaphores,
                   VkSemaphore* renderFinishedSemaphore);

// Releases what was built for a swapchain. Must run before the swapchain is destroyed.
void OverlayReleaseSwapchain(DeviceData* deviceData, VkSwapchainKHR swapchain);

// Releases everything built for a device. Must run before the device is destroyed.
void OverlayReleaseDevice(DeviceData* deviceData);
