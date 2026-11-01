#!/usr/bin/env python3
"""Prints the vtable of a C++ class from a stripped Linux shared library, using Itanium RTTI to find it.

Usage:
  ./tools/dump-vtable.py <lib.so> <ClassName> [--disas N]

Example, checking the INetworkMessages indexes used by the plugin against the shipped binary:
  ./tools/dump-vtable.py "$HOME/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/bin/linuxsteamrt64/libnetworksystem.so" CNetworkMessages --disas 4

Each vtable slot is printed with its index and the address of the function it points to. With --disas, the first N
instructions of every function are printed too (requires objdump), which is usually enough to recognize the small
ones: a setter of a byte member is a single `mov` to an offset of `this`, its getter a single `movzbl` from the same
offset. Bigger functions are identified by the strings they reference, `strings -t x` gives the file offset of a
string, which equals its address in the sections this script reads.

How it works: the typeinfo name of a class is its mangled name without the _Z prefix ("16CNetworkMessages"), the
typeinfo object points to that name, and the vtable points to the typeinfo object right before its first function
slot, after the offset-to-top entry. Valve ships the libraries with relative relocations whose targets are stored in
place, so the pointers can be followed by scanning the file directly, no dynamic linking needed.
"""

import argparse
import bisect
import struct
import subprocess
import sys


def fail(message):
    print(message, file=sys.stderr)
    raise SystemExit(1)


class Elf:
    def __init__(self, path):
        self.data = open(path, "rb").read()
        if self.data[:4] != b"\x7fELF" or self.data[4] != 2:
            fail(f"{path} is not a 64-bit ELF file")

        section_offset, section_size, section_count = struct.unpack_from("<QHH", self.data, 0x28)[0:1] + struct.unpack_from("<HH", self.data, 0x3a)
        self.sections = []
        for i in range(section_count):
            base = section_offset + i * section_size
            _, sh_type, flags, addr, offset, size = struct.unpack_from("<IIQQQQ", self.data, base)
            # Only allocated sections with file contents (not SHT_NOBITS such as .bss) can be scanned.
            if sh_type != 8 and flags & 0x2 and size > 0:
                self.sections.append((addr, offset, size))
        self.sections.sort()
        self.section_addrs = [section[0] for section in self.sections]

    def file_offset(self, addr):
        i = bisect.bisect_right(self.section_addrs, addr) - 1
        if i < 0:
            return None
        section_addr, offset, size = self.sections[i]
        if addr >= section_addr + size:
            return None

        return offset + (addr - section_addr)

    def read_qword(self, addr):
        offset = self.file_offset(addr)

        return struct.unpack_from("<Q", self.data, offset)[0] if offset is not None else None

    # Addresses of every occurrence of the given bytes across the allocated sections.
    def find_bytes(self, needle):
        addrs = []
        for section_addr, offset, size in self.sections:
            start = offset
            while True:
                i = self.data.find(needle, start, offset + size)
                if i < 0:
                    break
                addrs.append(section_addr + (i - offset))
                start = i + 1

        return addrs

    def find_qword(self, value):
        return self.find_bytes(struct.pack("<Q", value))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("lib_path")
    parser.add_argument("class_name")
    parser.add_argument("--disas", type=int, default=0, metavar="N",
                        help="print the first N instructions of every slot (requires objdump)")
    parser.add_argument("--contains", metavar="ADDR",
                        help="tell which slot the instruction at this hex address belongs to (requires objdump)")
    parser.add_argument("--raw-name", action="store_true",
                        help="take the class name as the verbatim typeinfo name, for local or template classes whose "
                             "mangled name is not just a length and an identifier, e.g. the '*Z...E10CLambdaJob' "
                             "class of a lambda queued from a method (copy it from `strings`)")
    parsed = parser.parse_args()
    lib_path, class_name, disas_count = parsed.lib_path, parsed.class_name, parsed.disas

    elf = Elf(lib_path)

    # The typeinfo name has no _Z prefix: "16CNetworkMessages" for CNetworkMessages. The preceding byte is checked so
    # "16CNetworkMessages" doesn't match inside "P16CNetworkMessages" or a longer class name ending the same way.
    mangled = class_name.encode() if parsed.raw_name else f"{len(class_name)}{class_name}".encode()
    name_addrs = [addr for addr in elf.find_bytes(mangled + b"\x00")
                  if not chr(elf.data[elf.file_offset(addr) - 1]).isalnum()]
    if not name_addrs:
        fail(f"Typeinfo name {mangled.decode()} not found, is {class_name} a class of this library?")

    for name_addr in name_addrs:
        # The typeinfo object is [vtable of the typeinfo class, name, ...bases]; a pointer to the name at some
        # address X means the typeinfo object starts at X - 8.
        for typeinfo_addr in (addr - 8 for addr in elf.find_qword(name_addr)):
            # The primary vtable is [offset-to-top = 0, typeinfo, first slot...].
            for typeinfo_slot_addr in elf.find_qword(typeinfo_addr):
                if elf.read_qword(typeinfo_slot_addr - 8) != 0 or typeinfo_slot_addr - 8 == typeinfo_addr:
                    continue

                print(f"{class_name} vtable at {typeinfo_slot_addr + 8:#x} in {lib_path}")
                slots = []
                slot_addr = typeinfo_slot_addr + 8
                # A vtable ends where the next one begins (offset-to-top then typeinfo) or on a non-function entry.
                while True:
                    target = elf.read_qword(slot_addr)
                    if target is None or target == 0 or elf.file_offset(target) is None:
                        break
                    slots.append(target)
                    print(f"  slot {len(slots) - 1:3}: {target:#x}")
                    slot_addr += 8

                if parsed.contains is not None:
                    # The instruction belongs to the slot starting closest below it, unless a non-virtual function
                    # lies in between, which shows up as the int3 padding separating functions.
                    target = int(parsed.contains, 16)
                    starts = [start for start in slots if start <= target]
                    if not starts:
                        print(f"{target:#x} is before every slot of this vtable")
                        return
                    start = max(starts)
                    result = subprocess.run(
                        ["objdump", "-d", "--no-show-raw-insn", f"--start-address={start:#x}",
                         f"--stop-address={target + 1:#x}", lib_path],
                        capture_output=True, text=True)
                    if "int3" in result.stdout:
                        print(f"{target:#x} is not inside a virtual of {class_name}: the closest slot starting "
                              f"below it, {slots.index(start)} at {start:#x}, is padded off before reaching it")
                    else:
                        print(f"{target:#x} is inside slot {slots.index(start)}, which starts at {start:#x}")

                if disas_count > 0:
                    for i, target in enumerate(slots):
                        stop = target + 0x40
                        result = subprocess.run(
                            ["objdump", "-d", "--no-show-raw-insn", f"--start-address={target:#x}",
                             f"--stop-address={stop:#x}", lib_path],
                            capture_output=True, text=True)
                        lines = [line.split("\t", 1)[-1].strip() for line in result.stdout.splitlines()
                                 if "\t" in line][:disas_count]
                        print(f"  slot {i:3} at {target:#x}:")
                        for line in lines:
                            print(f"        {line}")
                return


if __name__ == "__main__":
    main()
