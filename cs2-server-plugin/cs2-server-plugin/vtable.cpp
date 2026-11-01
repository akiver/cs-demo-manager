#include "vtable.h"

#include "log.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/mman.h>

#include <cerrno>
#include <cstdint>
#include <cstring>
#define PAGESIZE 4096
#endif

bool PatchVTableEntry(void** vtable, int index, void* newFunc) {
#ifdef _WIN32
    size_t protectSize = sizeof(void*) * (index + 1);
    DWORD oldProtect = 0;
    if (!VirtualProtect(vtable, protectSize, PAGE_EXECUTE_READWRITE, &oldProtect)) {
        Log("VirtualProtect PAGE_EXECUTE_READWRITE failed: %d", GetLastError());
        return false;
    }
    vtable[index] = newFunc;
    DWORD ignore = 0;
    if (!VirtualProtect(vtable, protectSize, oldProtect, &ignore)) {
        Log("VirtualProtect restore failed: %d", GetLastError());
    }
#else
    // Protect the slot's page, not the base's: the slot can be on a later page.
    void* slotAddr = (void*)&vtable[index];
    void* pageStart = (void*)((uintptr_t)slotAddr & ~(PAGESIZE - 1));
    if (mprotect(pageStart, PAGESIZE, PROT_READ | PROT_WRITE | PROT_EXEC) != 0) {
        Log("mprotect failed: %s", strerror(errno));
        return false;
    }
    vtable[index] = newFunc;
    if (mprotect(pageStart, PAGESIZE, PROT_READ) != 0) {
        Log("mprotect restore failed: %s", strerror(errno));
    }
#endif

    return true;
}
