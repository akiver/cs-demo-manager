#include "library.h"

#include "log.h"

#ifdef _WIN32
#include <windows.h>

#include <cstdio>
#else
#include <dlfcn.h>
#endif

void* GetLibAddress(void* lib, const char* name) {
#if defined _WIN32
    return GetProcAddress((HMODULE)lib, name);
#else
    return dlsym(lib, name);
#endif
}

char* GetLastErrorString() {
#ifdef _WIN32
    DWORD error = GetLastError();
    static char s[_MAX_U64TOSTR_BASE2_COUNT];
    sprintf(s, "%lu", error);

    return s;
#else
    return dlerror();
#endif
}

void* LoadLib(const char* path) {
#ifdef _WIN32
    return LoadLibrary(path);
#else
    return dlopen(path, RTLD_NOW);
#endif
}

void* GetLoadedLibInterface(const char* libName, const char* interfaceName, bool logFailures) {
#ifdef _WIN32
    void* lib = GetModuleHandleA(libName);
#else
    void* lib = dlopen(libName, RTLD_NOW | RTLD_NOLOAD);
#endif
    if (lib == NULL) {
        if (logFailures) {
            Log("Lib %s not loaded", libName);
        }
        return NULL;
    }

    CreateInterfaceFn createInterface = (CreateInterfaceFn)GetLibAddress(lib, "CreateInterface");
    if (createInterface == NULL) {
        if (logFailures) {
            Log("CreateInterface not found in %s", libName);
        }
        return NULL;
    }

    void* result = createInterface(interfaceName, NULL);
    if (result == NULL && logFailures) {
        Log("Interface %s not found in %s", interfaceName, libName);
    }

    return result;
}

void* FindInterface(const char* libName, const char* interfaceName, CreateInterfaceFn factory) {
    void* result = GetLoadedLibInterface(libName, interfaceName, false);
    if (result != NULL) {
        return result;
    }

    return factory != NULL ? factory(interfaceName, NULL) : NULL;
}
