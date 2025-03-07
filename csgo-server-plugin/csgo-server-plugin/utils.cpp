#include "utils.h"
#include <fstream>
#ifdef _WIN32
#include <windows.h>
#else
#include <dlfcn.h>
#include <sys/mman.h>
#endif

void LogToFile(const char* pMsg) {
    FILE* pFile = fopen("csdm.log", "a");
    if (pFile == NULL)
    {
        return;
    }

    fprintf(pFile, "%s\n", pMsg);
    fclose(pFile);
}

void Log(const char* msg, ...)
{
    va_list args;
    va_start(args, msg);
    char buf[1024] = {};
    vsnprintf(buf, sizeof(buf), msg, args);
    ConColorMsg(Color(227, 0, 255, 255), "CSDM: %s\n", buf);
    va_end(args);
    LogToFile(buf);
}


void DeleteLogFile()
{
    remove("csdm.log");
}

bool FileExists(const std::string& name) {
    std::ifstream f(name.c_str());

    return f.good();
}

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
    sprintf_s(s, "%lu", error);

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

void FreeLib(void* lib)
{
#ifdef _WIN32
    FreeLibrary((HMODULE)lib);
#else
    dlclose(lib);
#endif
}

#ifdef _WIN32
int ChangeMemoryProtection(void* addr, SIZE_T size, DWORD newProtect, PDWORD oldProtect) {
    return VirtualProtect(addr, size, newProtect, oldProtect);
}
#else
int ChangeMemoryProtection(void* addr, size_t size, int prot) {
    size_t pageSize = sysconf(_SC_PAGESIZE);
    uintptr_t start = (uintptr_t)addr & ~(pageSize - 1);
    return mprotect((void*)start, size, prot);
}
#endif
