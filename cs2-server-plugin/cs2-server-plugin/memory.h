#pragma once

#include <cstddef>

// True if the whole range is readable in this process. The check itself never faults.
bool IsReadableMemory(const void* address, size_t size);

// True if the value is aligned and in the canonical user-space range. Doesn't touch the memory.
bool IsPlausiblePointer(const void* pointer);

// True if the address is readable and its first word (a vtable or first member pointer) is a plausible pointer.
bool IsObject(const void* object);
