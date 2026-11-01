#define _GNU_SOURCE 1

#include "vulkan_layer.h"

#include <dlfcn.h>
#include <vulkan/vk_layer.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <map>
#include <mutex>
#include <vector>

#include "log.h"
#include "vulkan_overlay.h"

struct InstanceData {
    VkInstance instance;
    uint32_t apiVersion;
    InstanceDispatch dispatch;
};

// Guards the two maps below and the per-device queue families and swapchain infos. Instances and devices are created
// on the main thread while presents happen on the render thread.
static std::mutex layerMutex;
static std::map<void*, InstanceData*> instanceDataByKey;
static std::map<void*, DeviceData*> deviceDataByKey;

static InstanceData* FindInstanceData(void* dispatchableObject) {
    std::lock_guard<std::mutex> lock(layerMutex);
    auto it = instanceDataByKey.find(VK_DISPATCH_KEY(dispatchableObject));

    return it == instanceDataByKey.end() ? NULL : it->second;
}

static DeviceData* FindDeviceData(void* dispatchableObject) {
    std::lock_guard<std::mutex> lock(layerMutex);
    auto it = deviceDataByKey.find(VK_DISPATCH_KEY(dispatchableObject));

    return it == deviceDataByKey.end() ? NULL : it->second;
}

static VkLayerInstanceCreateInfo* FindInstanceChainInfo(const VkInstanceCreateInfo* createInfo) {
    VkLayerInstanceCreateInfo* info = (VkLayerInstanceCreateInfo*)createInfo->pNext;
    while (info != NULL &&
           !(info->sType == VK_STRUCTURE_TYPE_LOADER_INSTANCE_CREATE_INFO && info->function == VK_LAYER_LINK_INFO)) {
        info = (VkLayerInstanceCreateInfo*)info->pNext;
    }

    return info;
}

static VkLayerDeviceCreateInfo* FindDeviceChainInfo(const VkDeviceCreateInfo* createInfo) {
    VkLayerDeviceCreateInfo* info = (VkLayerDeviceCreateInfo*)createInfo->pNext;
    while (info != NULL &&
           !(info->sType == VK_STRUCTURE_TYPE_LOADER_DEVICE_CREATE_INFO && info->function == VK_LAYER_LINK_INFO)) {
        info = (VkLayerDeviceCreateInfo*)info->pNext;
    }

    return info;
}

static VKAPI_ATTR VkResult VKAPI_CALL NewCreateInstance(const VkInstanceCreateInfo* createInfo,
                                                        const VkAllocationCallbacks* allocator, VkInstance* instance) {
    VkLayerInstanceCreateInfo* chainInfo = FindInstanceChainInfo(createInfo);
    if (chainInfo == NULL || chainInfo->u.pLayerInfo == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    PFN_vkGetInstanceProcAddr nextGetInstanceProcAddr = chainInfo->u.pLayerInfo->pfnNextGetInstanceProcAddr;
    PFN_vkCreateInstance createInstance = (PFN_vkCreateInstance)nextGetInstanceProcAddr(NULL, "vkCreateInstance");
    if (createInstance == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    // Advance the link so the next layer in the chain reads its own info.
    chainInfo->u.pLayerInfo = chainInfo->u.pLayerInfo->pNext;

    LayerLog("NewCreateInstance: about to call down the chain");
    VkResult result = createInstance(createInfo, allocator, instance);
    LayerLog("NewCreateInstance: createInstance returned %d", (int)result);
    if (result != VK_SUCCESS) {
        return result;
    }

    InstanceData* data = new InstanceData();
    data->instance = *instance;
    // ImGui picks which Vulkan functions to load from this version, so it must be the instance's version, not the newer
    // one our Vulkan headers may define. A zero or missing apiVersion means 1.0 per the spec.
    data->apiVersion = createInfo->pApplicationInfo != NULL && createInfo->pApplicationInfo->apiVersion != 0
                           ? createInfo->pApplicationInfo->apiVersion
                           : VK_API_VERSION_1_0;
    data->dispatch.GetInstanceProcAddr = nextGetInstanceProcAddr;
    data->dispatch.DestroyInstance = (PFN_vkDestroyInstance)nextGetInstanceProcAddr(*instance, "vkDestroyInstance");

    {
        std::lock_guard<std::mutex> lock(layerMutex);
        instanceDataByKey[VK_DISPATCH_KEY(*instance)] = data;
    }

    return VK_SUCCESS;
}

static VKAPI_ATTR void VKAPI_CALL NewDestroyInstance(VkInstance instance, const VkAllocationCallbacks* allocator) {
    InstanceData* data = FindInstanceData(instance);
    if (data == NULL) {
        return;
    }

    {
        std::lock_guard<std::mutex> lock(layerMutex);
        instanceDataByKey.erase(VK_DISPATCH_KEY(instance));
    }

    data->dispatch.DestroyInstance(instance, allocator);
    delete data;
}

#define LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, name) \
    (dispatch).name = (PFN_vk##name)(getDeviceProcAddr)((device), "vk" #name)

static void LoadDeviceDispatch(DeviceDispatch& dispatch, PFN_vkGetDeviceProcAddr getDeviceProcAddr, VkDevice device) {
    dispatch.GetDeviceProcAddr = getDeviceProcAddr;
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyDevice);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, GetDeviceQueue);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, GetDeviceQueue2);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DeviceWaitIdle);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, QueueSubmit);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateSwapchainKHR);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroySwapchainKHR);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, GetSwapchainImagesKHR);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, QueuePresentKHR);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateImageView);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyImageView);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateRenderPass);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyRenderPass);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateFramebuffer);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyFramebuffer);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateCommandPool);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyCommandPool);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, AllocateCommandBuffers);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, BeginCommandBuffer);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, EndCommandBuffer);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, ResetCommandBuffer);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CmdBeginRenderPass);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CmdEndRenderPass);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateFence);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroyFence);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, WaitForFences);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, ResetFences);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, CreateSemaphore);
    LOAD_DEVICE_FUNCTION(dispatch, getDeviceProcAddr, device, DestroySemaphore);
}

static VKAPI_ATTR VkResult VKAPI_CALL NewCreateDevice(VkPhysicalDevice physicalDevice,
                                                      const VkDeviceCreateInfo* createInfo,
                                                      const VkAllocationCallbacks* allocator, VkDevice* device) {
    VkLayerDeviceCreateInfo* chainInfo = FindDeviceChainInfo(createInfo);
    if (chainInfo == NULL || chainInfo->u.pLayerInfo == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    PFN_vkGetInstanceProcAddr nextGetInstanceProcAddr = chainInfo->u.pLayerInfo->pfnNextGetInstanceProcAddr;
    PFN_vkGetDeviceProcAddr nextGetDeviceProcAddr = chainInfo->u.pLayerInfo->pfnNextGetDeviceProcAddr;
    chainInfo->u.pLayerInfo = chainInfo->u.pLayerInfo->pNext;

    InstanceData* instanceData = FindInstanceData(physicalDevice);
    VkInstance instance = instanceData != NULL ? instanceData->instance : VK_NULL_HANDLE;
    PFN_vkCreateDevice createDevice = (PFN_vkCreateDevice)nextGetInstanceProcAddr(instance, "vkCreateDevice");
    if (createDevice == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    LayerLog("NewCreateDevice: about to call down the chain");
    VkResult result = createDevice(physicalDevice, createInfo, allocator, device);
    LayerLog("NewCreateDevice: createDevice returned %d, instanceData=%p", (int)result, (void*)instanceData);
    if (result != VK_SUCCESS) {
        return result;
    }

    // Registered even when its instance isn't known: every device function the game resolves goes through this layer,
    // and the chain below ours is only reachable from here. The overlay stays off on such a device, see
    // NewCreateSwapchainKHR.
    DeviceData* data = new DeviceData();
    data->instance = instance;
    data->physicalDevice = physicalDevice;
    data->device = *device;
    data->apiVersion = instanceData != NULL ? instanceData->apiVersion : VK_API_VERSION_1_0;
    data->nextGetInstanceProcAddr = nextGetInstanceProcAddr;
    data->nextGetDeviceProcAddr = nextGetDeviceProcAddr;
    LoadDeviceDispatch(data->dispatch, nextGetDeviceProcAddr, *device);

    {
        std::lock_guard<std::mutex> lock(layerMutex);
        deviceDataByKey[VK_DISPATCH_KEY(*device)] = data;
    }

    return VK_SUCCESS;
}

static VKAPI_ATTR void VKAPI_CALL NewDestroyDevice(VkDevice device, const VkAllocationCallbacks* allocator) {
    DeviceData* data = FindDeviceData(device);
    if (data == NULL) {
        return;
    }

    OverlayReleaseDevice(data);

    {
        std::lock_guard<std::mutex> lock(layerMutex);
        deviceDataByKey.erase(VK_DISPATCH_KEY(device));
    }

    data->dispatch.DestroyDevice(device, allocator);
    delete data;
}

// vkQueuePresentKHR only receives the queue, and Vulkan can't map a queue back to its family (needed for the overlay's
// command pool), so the family of every queue is recorded when the game fetches it.
static void RecordQueueFamily(DeviceData* data, VkQueue queue, uint32_t queueFamilyIndex) {
    if (queue == VK_NULL_HANDLE) {
        return;
    }

    std::lock_guard<std::mutex> lock(layerMutex);
    data->queueFamilyByQueue[queue] = queueFamilyIndex;
}

bool FindQueueFamily(DeviceData* data, VkQueue queue, uint32_t* queueFamilyIndex) {
    std::lock_guard<std::mutex> lock(layerMutex);
    auto it = data->queueFamilyByQueue.find(queue);
    if (it == data->queueFamilyByQueue.end()) {
        return false;
    }

    *queueFamilyIndex = it->second;

    return true;
}

static VKAPI_ATTR void VKAPI_CALL NewGetDeviceQueue(VkDevice device, uint32_t queueFamilyIndex, uint32_t queueIndex,
                                                    VkQueue* queue) {
    DeviceData* data = FindDeviceData(device);
    if (data == NULL) {
        *queue = VK_NULL_HANDLE;
        return;
    }

    data->dispatch.GetDeviceQueue(device, queueFamilyIndex, queueIndex, queue);
    RecordQueueFamily(data, *queue, queueFamilyIndex);
}

static VKAPI_ATTR void VKAPI_CALL NewGetDeviceQueue2(VkDevice device, const VkDeviceQueueInfo2* queueInfo,
                                                     VkQueue* queue) {
    DeviceData* data = FindDeviceData(device);
    // Missing on a Vulkan 1.0 device.
    if (data == NULL || data->dispatch.GetDeviceQueue2 == NULL) {
        *queue = VK_NULL_HANDLE;
        return;
    }

    data->dispatch.GetDeviceQueue2(device, queueInfo, queue);
    RecordQueueFamily(data, *queue, queueInfo->queueFamilyIndex);
}

static VKAPI_ATTR VkResult VKAPI_CALL NewCreateSwapchainKHR(VkDevice device, const VkSwapchainCreateInfoKHR* createInfo,
                                                            const VkAllocationCallbacks* allocator,
                                                            VkSwapchainKHR* swapchain) {
    DeviceData* data = FindDeviceData(device);
    if (data == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    if (data->instance == VK_NULL_HANDLE) {
        return data->dispatch.CreateSwapchainKHR(device, createInfo, allocator, swapchain);
    }

    VkSwapchainCreateInfoKHR patched = *createInfo;
    // ImGui draws the panel in a render pass whose framebuffers target the presented images, so the swapchain must
    // allow color attachment usage.
    patched.imageUsage |= VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT;

    VkResult result = data->dispatch.CreateSwapchainKHR(device, &patched, allocator, swapchain);
    if (result != VK_SUCCESS) {
        return result;
    }

    SwapchainInfo info = {};
    info.format = createInfo->imageFormat;
    info.extent = createInfo->imageExtent;
    info.minImageCount = createInfo->minImageCount;

    std::lock_guard<std::mutex> lock(layerMutex);
    data->swapchainInfos[*swapchain] = info;

    return VK_SUCCESS;
}

static VKAPI_ATTR void VKAPI_CALL NewDestroySwapchainKHR(VkDevice device, VkSwapchainKHR swapchain,
                                                         const VkAllocationCallbacks* allocator) {
    DeviceData* data = FindDeviceData(device);
    if (data == NULL) {
        return;
    }

    // The overlay's image views and framebuffers reference the swapchain images, so they are released first.
    OverlayReleaseSwapchain(data, swapchain);

    {
        std::lock_guard<std::mutex> lock(layerMutex);
        data->swapchainInfos.erase(swapchain);
    }

    data->dispatch.DestroySwapchainKHR(device, swapchain, allocator);
}

static VKAPI_ATTR VkResult VKAPI_CALL NewQueuePresentKHR(VkQueue queue, const VkPresentInfoKHR* presentInfo) {
    DeviceData* data = FindDeviceData(queue);
    if (data == NULL) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    if (!IsOverlayVisible() || presentInfo->swapchainCount == 0) {
        return data->dispatch.QueuePresentKHR(queue, presentInfo);
    }

    // CS2 presents to a single swapchain, and one ImGui frame is built per present.
    VkSwapchainKHR swapchain = presentInfo->pSwapchains[0];
    SwapchainInfo info;
    {
        std::lock_guard<std::mutex> lock(layerMutex);
        auto it = data->swapchainInfos.find(swapchain);
        if (it == data->swapchainInfos.end()) {
            return data->dispatch.QueuePresentKHR(queue, presentInfo);
        }

        info = it->second;
    }

    VkSemaphore renderFinishedSemaphore = VK_NULL_HANDLE;
    bool isDrawn =
        OverlayRender(data, queue, swapchain, info, presentInfo->pImageIndices[0], presentInfo->waitSemaphoreCount,
                      presentInfo->pWaitSemaphores, &renderFinishedSemaphore);

    // The overlay's submission consumed the semaphores the present was going to wait on. Waiting on them again would
    // deadlock, so the present waits on the one that submission signals.
    VkPresentInfoKHR patched = *presentInfo;
    if (isDrawn) {
        patched.waitSemaphoreCount = 1;
        patched.pWaitSemaphores = &renderFinishedSemaphore;
    }

    return data->dispatch.QueuePresentKHR(queue, isDrawn ? &patched : presentInfo);
}

static VKAPI_ATTR PFN_vkVoidFunction VKAPI_CALL NewGetDeviceProcAddr(VkDevice device, const char* name);
static VKAPI_ATTR PFN_vkVoidFunction VKAPI_CALL NewGetInstanceProcAddr(VkInstance instance, const char* name);

struct InterceptedFunction {
    const char* name;
    PFN_vkVoidFunction function;
};

static const InterceptedFunction INSTANCE_FUNCTIONS[] = {
    {"vkGetInstanceProcAddr", (PFN_vkVoidFunction)&NewGetInstanceProcAddr},
    {"vkCreateInstance", (PFN_vkVoidFunction)&NewCreateInstance},
    {"vkDestroyInstance", (PFN_vkVoidFunction)&NewDestroyInstance},
    {"vkCreateDevice", (PFN_vkVoidFunction)&NewCreateDevice},
};

static const InterceptedFunction DEVICE_FUNCTIONS[] = {
    {"vkGetDeviceProcAddr", (PFN_vkVoidFunction)&NewGetDeviceProcAddr},
    {"vkDestroyDevice", (PFN_vkVoidFunction)&NewDestroyDevice},
    {"vkGetDeviceQueue", (PFN_vkVoidFunction)&NewGetDeviceQueue},
    {"vkGetDeviceQueue2", (PFN_vkVoidFunction)&NewGetDeviceQueue2},
    {"vkCreateSwapchainKHR", (PFN_vkVoidFunction)&NewCreateSwapchainKHR},
    {"vkDestroySwapchainKHR", (PFN_vkVoidFunction)&NewDestroySwapchainKHR},
    {"vkQueuePresentKHR", (PFN_vkVoidFunction)&NewQueuePresentKHR},
};

static PFN_vkVoidFunction FindInterceptedFunction(const InterceptedFunction* functions, size_t count,
                                                  const char* name) {
    for (size_t i = 0; i < count; i++) {
        if (strcmp(functions[i].name, name) == 0) {
            return functions[i].function;
        }
    }

    return NULL;
}

static VKAPI_ATTR PFN_vkVoidFunction VKAPI_CALL NewGetDeviceProcAddr(VkDevice device, const char* name) {
    PFN_vkVoidFunction function =
        FindInterceptedFunction(DEVICE_FUNCTIONS, sizeof(DEVICE_FUNCTIONS) / sizeof(DEVICE_FUNCTIONS[0]), name);
    if (function != NULL) {
        return function;
    }

    if (device == VK_NULL_HANDLE) {
        return NULL;
    }

    DeviceData* data = FindDeviceData(device);
    if (data == NULL) {
        return NULL;
    }

    return data->dispatch.GetDeviceProcAddr(device, name);
}

static VKAPI_ATTR PFN_vkVoidFunction VKAPI_CALL NewGetInstanceProcAddr(VkInstance instance, const char* name) {
    PFN_vkVoidFunction function =
        FindInterceptedFunction(INSTANCE_FUNCTIONS, sizeof(INSTANCE_FUNCTIONS) / sizeof(INSTANCE_FUNCTIONS[0]), name);
    if (function == NULL) {
        // The loader also asks the instance chain for device functions, before any device exists.
        function =
            FindInterceptedFunction(DEVICE_FUNCTIONS, sizeof(DEVICE_FUNCTIONS) / sizeof(DEVICE_FUNCTIONS[0]), name);
    }

    if (function != NULL) {
        return function;
    }

    if (instance == VK_NULL_HANDLE) {
        return NULL;
    }

    InstanceData* data = FindInstanceData(instance);
    if (data == NULL) {
        LayerLog("  -> FindInstanceData returned NULL for \"%s\" (instance not registered!)", name);
        return NULL;
    }

    PFN_vkVoidFunction forwarded = data->dispatch.GetInstanceProcAddr(instance, name);
    if (forwarded == NULL) {
        LayerLog("  -> forwarded NULL for \"%s\"", name);
    }

    return forwarded;
}

extern "C" {

// Layer entry point: the Vulkan loader calls it when loading the layer to get the functions it dispatches through.
CSDM_LAYER_EXPORT VKAPI_ATTR VkResult VKAPI_CALL
vkNegotiateLoaderLayerInterfaceVersion(VkNegotiateLayerInterface* versionStruct) {
    LayerLog("vkNegotiateLoaderLayerInterfaceVersion called (version=%u)",
             versionStruct != NULL ? versionStruct->loaderLayerInterfaceVersion : 0);
    if (versionStruct == NULL || versionStruct->sType != LAYER_NEGOTIATE_INTERFACE_STRUCT) {
        return VK_ERROR_INITIALIZATION_FAILED;
    }

    if (versionStruct->loaderLayerInterfaceVersion > 2) {
        versionStruct->loaderLayerInterfaceVersion = 2;
    }

    versionStruct->pfnGetInstanceProcAddr = &NewGetInstanceProcAddr;
    versionStruct->pfnGetDeviceProcAddr = &NewGetDeviceProcAddr;
    // Only needed to intercept physical device functions unknown to the loader, it skips the layer when NULL.
    versionStruct->pfnGetPhysicalDeviceProcAddr = NULL;

    return VK_SUCCESS;
}
}
