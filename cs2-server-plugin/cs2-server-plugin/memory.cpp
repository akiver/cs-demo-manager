#include "memory.h"

#include <cstdint>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#endif

bool IsPlausiblePointer(const void* pointer) {
    uintptr_t address = (uintptr_t)pointer;

    return address >= 0x10000 && address < 0x7FFFFFFFFFFFull && address % sizeof(void*) == 0;
}

bool IsReadableMemory(const void* address, size_t size) {
    uintptr_t value = (uintptr_t)address;
    // No alignment check, unlike IsPlausiblePointer: callers also use it before reading strings and members narrower
    // than a pointer, which can start at any byte offset.
    if (value < 0x10000 || value >= 0x7FFFFFFFFFFFull) {
        return false;
    }

#ifdef _WIN32
    MEMORY_BASIC_INFORMATION info;
    if (VirtualQuery(address, &info, sizeof(info)) == 0 || info.State != MEM_COMMIT) {
        return false;
    }

    DWORD readableProtections = PAGE_READONLY | PAGE_READWRITE | PAGE_WRITECOPY | PAGE_EXECUTE_READ |
                                PAGE_EXECUTE_READWRITE | PAGE_EXECUTE_WRITECOPY;
    if ((info.Protect & readableProtections) == 0 || (info.Protect & (PAGE_GUARD | PAGE_NOACCESS)) != 0) {
        return false;
    }

    // The whole read has to stay inside the region VirtualQuery reported on.
    return (uintptr_t)address + size <= (uintptr_t)info.BaseAddress + info.RegionSize;
#else
    // Offset scans can hand us an address on a mapped but unreadable page (a PROT_NONE guard page), which mincore
    // reports as present.
    // write() makes the kernel do the read: copy_from_user returns EFAULT for anything unreadable without faulting the
    // process. One byte per page is enough since readability is per page, and each byte is drained right away so the
    // pipe never fills.
    static int probePipe[2] = {-1, -1};
    if (probePipe[0] == -1 && pipe(probePipe) != 0) {
        return false;
    }

    static const long pageSize = sysconf(_SC_PAGESIZE);
    if (pageSize <= 0) {
        return false;
    }

    uintptr_t current = value;
    uintptr_t end = value + size;
    while (current < end) {
        if (write(probePipe[1], (const void*)current, 1) != 1) {
            return false;
        }
        char drained;
        if (read(probePipe[0], &drained, 1) != 1) {
            return false;
        }
        current = (current & ~((uintptr_t)pageSize - 1)) + (uintptr_t)pageSize;
    }

    return true;
#endif
}

bool IsObject(const void* object) {
    return IsReadableMemory(object, sizeof(void*)) && IsPlausiblePointer(*(void* const*)object);
}
