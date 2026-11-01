#!/usr/bin/env python3
"""Prints the vtable of a C++ class from a Windows DLL, using MSVC RTTI to find it. The counterpart of dump-vtable.py.

Usage:
  py -3 tools/dump-vtable-windows.py <lib.dll> <ClassName> [--disas N] [--contains ADDR] [--references TEXT]

Example, checking the ClientFullyConnect index used by the plugin against the shipped binary:
  py -3 tools/dump-vtable-windows.py "C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/bin/win64/server.dll" CSource2GameClients --references player_connect_full

Each vtable slot is printed with its index, its address and its RVA, the "engine2.dll+0x..." form the csdm_dump_*
commands print. A class with several bases has one vtable per base, each printed with the offset of its base in the
object. With --disas, the first N instructions of every function are printed too (requires dumpbin, which ships with
Visual Studio). --references finds the instructions loading a string or an address and the slot each one belongs to,
--contains the slot an instruction belongs to.

How it works: the type descriptor of a class is 16 bytes before its decorated name (".?AVCNetworkMessages@@"), each
complete object locator stores the RVA of the type descriptor and its own RVA, and a vtable is preceded by the address
of its locator. Functions are delimited by the unwind entries of the .pdata section, so which function an instruction
belongs to is exact, unlike with the int3 padding of the ELF tool.
"""

import argparse
import bisect
import glob
import os
import shutil
import struct
import subprocess
import sys

IMAGE_SCN_MEM_EXECUTE = 0x20000000
UNW_FLAG_CHAININFO = 0x4


def fail(message):
    print(message, file=sys.stderr)
    raise SystemExit(1)


class Pe:
    def __init__(self, path):
        self.data = open(path, "rb").read()
        if self.data[:2] != b"MZ":
            fail(f"{path} is not a PE file")
        pe_offset = struct.unpack_from("<I", self.data, 0x3C)[0]
        if self.data[pe_offset:pe_offset + 4] != b"PE\0\0":
            fail(f"{path} is not a PE file")
        section_count, optional_header_size = struct.unpack_from("<H12xH", self.data, pe_offset + 6)
        optional_header = pe_offset + 24
        if struct.unpack_from("<H", self.data, optional_header)[0] != 0x20B:
            fail(f"{path} is not a 64-bit PE file")
        self.image_base = struct.unpack_from("<Q", self.data, optional_header + 24)[0]
        # Data directory 3 is the exception directory, the .pdata table of RUNTIME_FUNCTION entries.
        exception_rva, exception_size = struct.unpack_from("<II", self.data, optional_header + 112 + 3 * 8)

        self.sections = []
        for i in range(section_count):
            base = optional_header + optional_header_size + i * 40
            virtual_size, rva, raw_size, raw_offset = struct.unpack_from("<IIII", self.data, base + 8)
            characteristics = struct.unpack_from("<I", self.data, base + 36)[0]
            size = min(virtual_size, raw_size)
            if size > 0:
                self.sections.append((rva, raw_offset, size, bool(characteristics & IMAGE_SCN_MEM_EXECUTE)))
        self.sections.sort()
        self.section_rvas = [section[0] for section in self.sections]

        self.functions = {}
        for i in range(exception_size // 12):
            begin, end, unwind = struct.unpack_from("<III", self.data, self.file_offset(exception_rva) + i * 12)
            self.functions[begin] = (end, unwind)
        self.function_starts = sorted(self.functions)

    def file_offset(self, rva):
        i = bisect.bisect_right(self.section_rvas, rva) - 1
        if i < 0:
            return None
        section_rva, offset, size, _ = self.sections[i]
        if rva >= section_rva + size:
            return None

        return offset + (rva - section_rva)

    def is_code(self, rva):
        i = bisect.bisect_right(self.section_rvas, rva) - 1
        if i < 0:
            return False
        section_rva, _, size, executable = self.sections[i]

        return executable and rva < section_rva + size

    def read(self, fmt, rva):
        offset = self.file_offset(rva)

        return struct.unpack_from(fmt, self.data, offset)[0] if offset is not None else None

    def read_string(self, rva):
        offset = self.file_offset(rva)

        return self.data[offset:self.data.index(b"\0", offset)].decode("latin-1")

    # RVAs of every occurrence of the given bytes across the sections.
    def find_bytes(self, needle):
        rvas = []
        for section_rva, offset, size, _ in self.sections:
            start = offset
            while True:
                i = self.data.find(needle, start, offset + size)
                if i < 0:
                    break
                rvas.append(section_rva + (i - offset))
                start = i + 1

        return rvas

    # RVA of the function containing the code at this RVA, following the chained unwind entries of the parts a
    # function is split into back to its entry point. None for a leaf function, which has no unwind entry.
    def function_start(self, rva):
        i = bisect.bisect_right(self.function_starts, rva) - 1
        if i < 0 or rva >= self.functions[self.function_starts[i]][0]:
            return None
        begin = self.function_starts[i]
        while True:
            unwind = self.functions[begin][1]
            flags = self.read("<B", unwind) >> 3
            if not flags & UNW_FLAG_CHAININFO:
                return begin
            # The chained RUNTIME_FUNCTION follows the unwind codes, whose count is rounded up to an even number.
            code_count = self.read("<B", unwind + 2)
            begin = self.read("<I", unwind + 4 + 2 * ((code_count + 1) & ~1))

    # End RVA of the last function with an unwind entry starting at or before this RVA, 0 when there is none.
    def previous_function_end(self, rva):
        i = bisect.bisect_right(self.function_starts, rva) - 1

        return self.functions[self.function_starts[i]][0] if i >= 0 else 0

    # RVAs of the RIP-relative operands pointing at the target, assuming the operand is followed by nothing (lea, mov,
    # call), an imm8 or an imm32, the forms code loading an address takes.
    def find_references(self, target):
        refs = []
        for section_rva, offset, size, executable in self.sections:
            if not executable:
                continue
            code = self.data[offset:offset + size]
            for phase in range(4):
                count = (len(code) - phase) // 4
                values = memoryview(code[phase:phase + count * 4]).cast("i")
                for tail in (0, 1, 4):
                    # The operand at section_rva + phase + 4k points at target when value + 4k equals this.
                    expected = target - section_rva - phase - 4 - tail
                    refs += [section_rva + phase + 4 * k for k, value in enumerate(values)
                             if value + 4 * k == expected]

        return sorted(refs)


def find_dumpbin():
    path = os.environ.get("DUMPBIN") or shutil.which("dumpbin")
    if path:
        return path
    vswhere = os.path.join(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)"),
                           r"Microsoft Visual Studio\Installer\vswhere.exe")
    if os.path.exists(vswhere):
        result = subprocess.run([vswhere, "-latest", "-property", "installationPath"], capture_output=True, text=True)
        matches = sorted(glob.glob(os.path.join(result.stdout.strip(), r"VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe")))
        if matches:
            return matches[-1]
    fail("dumpbin not found, install Visual Studio with the C++ workload or set DUMPBIN to its path")


# The instructions dumpbin prints between two addresses, without the raw bytes.
def disassemble(dumpbin, lib_path, start, stop):
    result = subprocess.run([dumpbin, "/NOLOGO", "/DISASM", f"/RANGE:{start:#x},{stop:#x}", lib_path],
                            capture_output=True, text=True)
    instructions = []
    for line in result.stdout.splitlines():
        # "  0000000180DEB6E0: 40 53              push        rbx", the bytes take a fixed width column.
        address, _, rest = line.strip().partition(": ")
        if len(address) == 16 and len(rest) > 19 and rest[19:].strip():
            instructions.append((int(address, 16), " ".join(rest[19:].split())))

    return instructions


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("lib_path")
    parser.add_argument("class_name")
    parser.add_argument("--disas", type=int, default=0, metavar="N",
                        help="print the first N instructions of every slot (requires dumpbin)")
    parser.add_argument("--contains", metavar="ADDR",
                        help="tell which slot the instruction at this hex address belongs to, an RVA when it is below "
                             "the image base")
    parser.add_argument("--references", metavar="TEXT",
                        help="list the instructions loading this string, or this hex address when it starts with 0x "
                             "(an RVA when below the image base), and the slot of each")
    parser.add_argument("--raw-name", action="store_true",
                        help="take the class name as the verbatim decorated type name, for local or template classes, "
                             "e.g. the '.?AV<lambda_...>' class of a lambda queued from a method (copy it from the "
                             "strings of the DLL)")
    parsed = parser.parse_args()
    lib_path, class_name = parsed.lib_path, parsed.class_name

    pe = Pe(lib_path)

    def to_rva(value):
        address = int(value, 16)

        return address - pe.image_base if address >= pe.image_base else address

    def describe(rva):
        return f"{pe.image_base + rva:#x} (+{rva:#x})"

    # "class" and "struct" decorate differently, .?AV and .?AU.
    names = [class_name] if parsed.raw_name else [f".?AV{class_name}@@", f".?AU{class_name}@@"]
    descriptor_rvas = [rva - 16 for name in names for rva in pe.find_bytes(name.encode() + b"\0")]
    if not descriptor_rvas:
        fail(f"Type descriptor {names[0]} not found, is {class_name} a class of this library?")

    vtables = []
    for descriptor_rva in descriptor_rvas:
        for locator_rva in (rva - 0xC for rva in pe.find_bytes(struct.pack("<I", descriptor_rva))):
            # A complete object locator is [signature = 1, offset of the base in the object, constructor displacement
            # offset, type descriptor RVA, class hierarchy RVA, own RVA].
            if pe.read("<I", locator_rva) != 1 or pe.read("<I", locator_rva + 0x14) != locator_rva:
                continue
            for pointer_rva in pe.find_bytes(struct.pack("<Q", pe.image_base + locator_rva)):
                vtables.append((pe.read("<I", locator_rva + 4), pointer_rva + 8))
    if not vtables:
        fail(f"No vtable found for {class_name}, is it abstract?")

    references = []
    if parsed.references is not None:
        if parsed.references.startswith("0x"):
            targets = [(to_rva(parsed.references), "Address")]
        else:
            # The text may be a part of a string, the references point at its start.
            targets = []
            for rva in pe.find_bytes(parsed.references.encode()):
                start = rva
                while pe.read("<B", start - 1) not in (0, None):
                    start -= 1
                if not pe.is_code(start):
                    targets.append((start, f"String {pe.read_string(start)!r}"))
            if not targets:
                fail(f"String {parsed.references!r} not found")
        references = [(target, label, pe.find_references(target)) for target, label in targets]

    dumpbin = find_dumpbin() if parsed.disas > 0 else None
    for object_offset, vtable_rva in sorted(vtables):
        print(f"{class_name} vtable at {describe(vtable_rva)}, base at offset {object_offset:#x}, in {lib_path}")
        slots = []
        # A vtable ends at the locator pointer of the next one, or any other entry that isn't code.
        while True:
            target = pe.read("<Q", vtable_rva + 8 * len(slots))
            if target is None or not pe.is_code(target - pe.image_base):
                break
            slots.append(target - pe.image_base)
            print(f"  slot {len(slots) - 1:3}: {describe(slots[-1])}")

        def owner(rva):
            start = pe.function_start(rva)
            if start is None:
                # A leaf function has no unwind entry: it is the closest slot below, unless a function with one lies
                # in between.
                starts = [slot for slot in slots if pe.previous_function_end(rva) <= slot <= rva]
                if not starts:
                    return "code without unwind entry, a leaf function or bytes that only look like an operand"
                start = max(starts)
            if start not in slots:
                return f"the function at {describe(start)}, which is not a virtual of this vtable"
            indexes = ", ".join(str(i) for i, slot in enumerate(slots) if slot == start)

            return f"slot {indexes}, which starts at {describe(start)}"

        if parsed.contains is not None:
            rva = to_rva(parsed.contains)
            print(f"{describe(rva)} is inside {owner(rva)}")

        for target, label, refs in references:
            print(f"{label} at {describe(target)}: {len(refs)} reference(s)")
            for ref in refs:
                print(f"  operand at {describe(ref)} is inside {owner(ref)}")

        for i, target in enumerate(slots if dumpbin else []):
            print(f"  slot {i:3} at {describe(target)}:")
            address = pe.image_base + target
            for _, instruction in disassemble(dumpbin, lib_path, address, address + 0x40)[:parsed.disas]:
                print(f"        {instruction}")


if __name__ == "__main__":
    main()
