#ifdef CSDM_DEV_COMMANDS

#include <cstdio>
#include <cstdlib>
#include <cstring>

#include "cdll_interfaces.h"
#include "icvar.h"
#include "log.h"
#include "memory.h"
#include "plugin.h"

#ifdef _WIN32
#include <windows.h>
#else
#include <dlfcn.h>
#endif

// Reverse-engineering aid for the _Unknown_ slots of IDemoPlayer (cdll_interfaces.h): prints each vtable slot as
// module+offset and the object's RTTI class name for tools/dump-vtable.py. Slot numbers match the header's :NNN
// comments on Windows and are one higher on Linux from the demo tick getters onward (see the destructor note in the
// header). The vtable's length is unknown, so slots past its end print whatever data follows.

// Resolves which loaded module contains `address`, false when none does. Symbols aren't looked up since Valve strips
// them from the shipped binaries.
static bool ResolveModule(void* address, const char** moduleName, void** moduleBase) {
#ifdef _WIN32
    HMODULE module = NULL;
    if (!GetModuleHandleExA(GET_MODULE_HANDLE_EX_FLAG_FROM_ADDRESS | GET_MODULE_HANDLE_EX_FLAG_UNCHANGED_REFCOUNT,
                            (LPCSTR)address, &module) ||
        module == NULL) {
        return false;
    }

    static char path[MAX_PATH];
    if (GetModuleFileNameA(module, path, sizeof(path)) == 0) {
        return false;
    }

    const char* fileName = strrchr(path, '\\');
    *moduleName = fileName != NULL ? fileName + 1 : path;
    *moduleBase = (void*)module;

    return true;
#else
    Dl_info info;
    if (dladdr(address, &info) == 0 || info.dli_fname == NULL || info.dli_fbase == NULL) {
        return false;
    }

    const char* fileName = strrchr(info.dli_fname, '/');
    *moduleName = fileName != NULL ? fileName + 1 : info.dli_fname;
    *moduleBase = info.dli_fbase;

    return true;
#endif
}

static void LogModuleRelativeAddress(const char* label, void* address) {
    const char* moduleName;
    void* moduleBase;
    if (ResolveModule(address, &moduleName, &moduleBase)) {
        Log("%s: %p = %s+0x%llx", label, address, moduleName, (unsigned long long)((char*)address - (char*)moduleBase));
    } else {
        Log("%s: %p (no module)", label, address);
    }
}

// Reads the Itanium RTTI typeinfo name of an object, e.g. "11CDemoPlayer": the vtable entry before the first function
// slot points to the typeinfo object, whose second word points to the mangled class name. RTTI survives the stripping
// of the Linux binaries. Returns NULL when that chain doesn't lead to a readable name, and on Windows where MSVC lays
// out RTTI differently.
static const char* GetTypeinfoName(void* object) {
#ifdef _WIN32
    (void)object;
    return NULL;
#else
    void** vtable = *(void***)object;
    if (!IsReadableMemory(&vtable[-1], sizeof(void*)) || !IsObject(vtable[-1])) {
        return NULL;
    }

    const char* name = ((const char**)vtable[-1])[1];
    if (!IsReadableMemory(name, 1)) {
        return NULL;
    }

    return name;
#endif
}

CON_COMMAND(
    csdm_dump_demoplayer_vtable,
    "Prints the demo player vtable as module-relative offsets, usage: csdm_dump_demoplayer_vtable [slotCount]") {
    auto engine = GetEngine();
    if (engine == NULL) {
        Log("Engine interface not found");
        return;
    }

    auto demo = engine->GetDemoPlayer();
    if (demo == NULL) {
        Log("Demo player interface not found");
        return;
    }

    if (!IsObject(demo)) {
        Log("Demo player at %p doesn't look like an object", (void*)demo);
        return;
    }

    int slotCount = args.ArgC() > 1 ? atoi(args.Arg(1)) : 24;
    if (slotCount < 1) {
        slotCount = 1;
    } else if (slotCount > 128) {
        slotCount = 128;
    }

    void** vtable = *(void***)demo;
    LogModuleRelativeAddress("Demo player vtable", (void*)vtable);

    const char* typeinfoName = GetTypeinfoName(demo);
    if (typeinfoName != NULL) {
        Log("Demo player typeinfo name: %s (class name for dump-vtable.py, drop the length prefix)", typeinfoName);
    }

    for (int slot = 0; slot < slotCount; slot++) {
        if (!IsReadableMemory(&vtable[slot], sizeof(void*))) {
            Log("Slot %03d: unreadable, stopping", slot);
            break;
        }

        char label[16];
        snprintf(label, sizeof(label), "Slot %03d", slot);
        LogModuleRelativeAddress(label, vtable[slot]);
    }
}

#endif
