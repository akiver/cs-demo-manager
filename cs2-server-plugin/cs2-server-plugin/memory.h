#pragma once

#include <cstddef>
#include <cstdint>

// True if the whole range is readable in this process. The check itself never faults.
bool IsReadableMemory(const void* address, size_t size);

// True if the value is aligned and in the canonical user-space range. Doesn't touch the memory.
bool IsPlausiblePointer(const void* pointer);

// True if the address is readable and its first word (a vtable or first member pointer) is a plausible pointer.
bool IsObject(const void* object);

#ifdef CSDM_DEV_COMMANDS
// Copies the string at the address when it looks like a printable C string of at least 3 characters.
bool ReadString(const uint8_t* address, char* string, size_t size);
#endif
