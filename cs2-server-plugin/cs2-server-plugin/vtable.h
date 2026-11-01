#pragma once

// Overwrites vtable[index] with newFunc, making its page writable for the write. Returns false, with the slot
// untouched, if the page can't be made writable.
bool PatchVTableEntry(void** vtable, int index, void* newFunc);
