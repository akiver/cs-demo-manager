#pragma once

#include "interface.h"

void* GetLibAddress(void* lib, const char* name);

char* GetLastErrorString();

void* LoadLib(const char* path);

void* GetLoadedLibInterface(const char* libName, const char* interfaceName, bool logFailures = true);

void* FindInterface(const char* libName, const char* interfaceName, CreateInterfaceFn factory);
