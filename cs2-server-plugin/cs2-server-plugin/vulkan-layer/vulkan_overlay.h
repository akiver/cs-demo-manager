#pragma once

#include "vulkan_layer.h"

bool IsOverlayVisible();

// Draws the panels over the swapchain image the game is about to present, on the queue it presents with. The
// submission waits on the present's semaphores and signals `renderFinishedSemaphore`, which the present must wait on
// instead. Returns false when nothing was drawn, in which case the present must be forwarded untouched.
bool OverlayRender(DeviceData* deviceData, VkQueue queue, VkSwapchainKHR swapchain, const SwapchainInfo& info,
                   uint32_t imageIndex, uint32_t waitSemaphoreCount, const VkSemaphore* waitSemaphores,
                   VkSemaphore* renderFinishedSemaphore);

// Replaces the game's copy of a movie or screenshot frame (startmovie) to its readback buffer, recorded in
// `commandBuffer`: the frame is converted to the byte order the game writes its image files in, and the panels are
// drawn on it. `region` copies the whole `image`, which is in `layout`. Returns false when nothing was recorded, in
// which case the game's copy must be recorded untouched.
bool OverlayRecordCapture(DeviceData* deviceData, VkCommandBuffer commandBuffer, VkImage image,
                          const CaptureCandidate& candidate, VkImageLayout layout, VkBuffer buffer,
                          const VkBufferImageCopy& region);

// The panels drawn on a capture read buffers ImGui reuses, so the layer follows the game's command buffer it was
// recorded in until it knows the draw is done. To call after the game's successful vkQueueSubmit.
void OverlayTrackSubmit(DeviceData* deviceData, VkQueue queue, uint32_t submitCount, const VkSubmitInfo* submits);

// The captures recorded in `secondaries` are submitted with `commandBuffer`.
void OverlayTrackExecuteCommands(DeviceData* deviceData, VkCommandBuffer commandBuffer, uint32_t secondaryCount,
                                 const VkCommandBuffer* secondaries);

// To call before the game records `commandBuffer` again.
void OverlayTrackBeginCommandBuffer(DeviceData* deviceData, VkCommandBuffer commandBuffer);

// Releases what was built for a swapchain. Must run before the swapchain is destroyed.
void OverlayReleaseSwapchain(DeviceData* deviceData, VkSwapchainKHR swapchain);

// Releases everything built for a device. Must run before the device is destroyed.
void OverlayReleaseDevice(DeviceData* deviceData);
