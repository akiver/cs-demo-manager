#pragma once
#include <dbg.h>
#include <cstdint>
#include <fstream>
#ifdef _WIN32
#include <windows.h>
#endif

void LogToFile(const char* pMsg);
void Log(const char* msg, ...);
void DeleteLogFile();
bool FileExists(const std::string& name);
void* GetLibAddress(void* lib, const char* name);
char* GetLastErrorString();
void* LoadLib(const char* path);
void FreeLib(void* lib);
#ifdef _WIN32
int ChangeMemoryProtection(void* addr, SIZE_T size, DWORD newProtect, PDWORD oldProtect);
#else
int ChangeMemoryProtection(void* addr, size_t size, int prot);
#endif