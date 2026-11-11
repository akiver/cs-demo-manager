# Matching vtable slots to methods

Notes for [`dump-vtable.py`](dump-vtable.py), the tool that finds the vtable of a class in a stripped Linux binary through
its RTTI and prints every slot. When to run it, and which indexes the plugin relies on, is covered in the
[plugin documentation](../AGENTS.md#verifying-vtable-indexes). This file is about reading its output: the tool prints
slot addresses and, with `--disas N`, the first instructions of each, and the work is to decide which SDK method each
slot is. The last section covers the Windows binaries, read by its counterpart
[`dump-vtable-windows.py`](dump-vtable-windows.py).

The addresses below (`160ad8`, `2b2627`...) are the values of one CS2 build, kept as a worked example. They change
with every update, the techniques don't. `lib.so` stands for the library of `game/bin/linuxsteamrt64/` implementing
the class, for example `libclient.so` for `CSource2Client`.

```sh
./dump-vtable.py "$HOME/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/bin/linuxsteamrt64/libnetworksystem.so" CNetworkMessages --disas 4
```

`./dump-vtable.py --help` lists the options.

## Requirements

- Python 3, standard library only. On Windows, run it with the launcher: `py -3 dump-vtable.py ...`. To read the
  Windows binaries instead, see [Windows binaries](#windows-binaries).
- GNU `objdump` for `--disas` and `--contains`, and `strings` for the string lookups below, both from binutils. Git
  for Windows ships neither: run those steps on Linux or in WSL. Without them, the tool still prints the slot
  addresses.
- The Linux binaries of the game. A Linux Steam install has them in `game/bin/linuxsteamrt64/`. From Windows, download
  them with [SteamFileDownloader](https://github.com/SteamTracking/SteamFileDownloader) into a folder outside the
  repository:

  ```sh
  SteamFileDownloader get 730 all --output <dir> -- "regex:\.(dll|so)$"
  ```

The class name is the _implementation_ class (`CNetworkMessages`), not the interface (`INetworkMessages`): abstract
interfaces have no typeinfo of their own in the binary.

Start by checking the count: the slots must follow the SDK declaration order, with two adjacent slots for the
destructor in a Linux binary, which makes it an easy landmark.

## Small methods

They are recognizable from `--disas` alone. A bool setter is a single `mov %sil, 0xNNN(%rdi); ret`, its getter the
matching `movzbl 0xNNN(%rdi),%eax; ret` on the same offset. In `CNetworkMessages` that pair is
`AllowAdditionalMessageRegistration`/`IsAdditionalMessageRegistrationAllowed`, at slots 25/26 in that build and 22/23
since the 11/11/2026 update.

## Big methods

They are identified by a string they reference. `FindOrCreateNetMessage` is anchored this way by its "illegal to
register new net messages after serialization" fatal error:

1. `strings -t x lib.so | grep "illegal to register"` prints the file offset of the string, `160ad8`, which equals its
   address in this binary.
2. `objdump -d lib.so | grep 160ad8` finds the one instruction loading that address, at `2b2627`. That is an
   instruction _inside_ the method, not its start.
3. `./dump-vtable.py lib.so CNetworkMessages --contains 0x2b2627` answers which slot that instruction belongs to: slot
   2, starting at `2b1ac0`. Functions occupy contiguous ranges, so the owner of an instruction is the function starting
   closest before it, which the tool picks as the largest slot address at or below the instruction. It then
   disassembles the range between the two addresses to check it contains no `int3`, the padding separating functions.
   One would mean the instruction belongs to some non-virtual function the vtable doesn't know about.

## Local classes of a method

A method that queues a lambda on the thread pool gets a job class generated for it, local to the method, and the
typeinfo name of that class embeds the mangled method
(`*ZN11IThreadPool17QueueJobWithFlagsIZN14CSource2Client16FrameStageNotifyE...E10CLambdaJob`, found with `strings`).
`./dump-vtable.py libclient.so '<that name>' --raw-name` prints the vtable of the job class. The one instruction loading that
vtable address is the construction of the job, and `--contains` on `CSource2Client` tells which slot it is in. That
is how `FrameStageNotify` is anchored at slot 36 of `Source2Client002` without any string.

## Members shared between methods

Two getters of the same class that read the same member, or a method that reads what another returns, confirm each
other's slot. In `CDemoPlayer`, `GetDemoTick` ends with a `sub` of the member `GetDemoStartTick` returns, and
`IsPlaybackPaused` and `IsSkipping` both start by testing the byte `IsPlaybackActive` returns.

## Globals shared between interfaces

`CEngineClient::GetDemoPlayer` is `lea G(%rip),%rax; mov (%rax),%rax; ret`, returning the pointer stored at a global.
`IsPlayingDemo` tail-jumps to a thunk that reads the same global and jumps through slot 12 of the object it points to,
which is `IDemoPlayer::IsPlaybackActive` on Linux. The two interfaces vouch for each other: a wrong `GetDemoPlayer`
slot returns another global, a wrong `IDemoPlayer` layout changes the slot the thunk jumps through.

## Runtime checks

Once the slots are matched, confirm them in the game with the dev commands of the
[plugin documentation](../AGENTS.md#verifying-vtable-indexes), which print what the plugin resolves through the
indexes, and with the plugin log: a hook that resolves the wrong method logs garbage or crashes. An agent runs them
from a dev build with `watch --exec` and reads their output in `csdm.log`, see
[Testing a change](../AGENTS.md#testing-a-change).

## Windows binaries

An interface with overloaded virtuals has to be checked in the Windows binary too, since MSVC orders overloads
differently (see the [plugin documentation](../AGENTS.md#verifying-vtable-indexes)). The DLLs are in `game/bin/win64/`
and `game/csgo/bin/win64/` (`client.dll`, `server.dll`) of the game folder, and
[`dump-vtable-windows.py`](dump-vtable-windows.py) does for them what `dump-vtable.py` does for the Linux binaries,
through the MSVC RTTI. It needs Python 3 only, plus `dumpbin` for `--disas`, which ships with Visual Studio and is
found through `vswhere` (or the `DUMPBIN` variable):

```sh
py -3 dump-vtable-windows.py "C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/bin/win64/server.dll" CSource2GameClients --references player_connect_full
```

What changes from the Linux tool:

- Every address is printed twice, absolute (`0x180deb6e0`, as `dumpbin` prints it) and as an RVA (`+0xdeb6e0`, as
  `csdm_dump_demoplayer_vtable` prints `engine2.dll+0x...`). `--contains` and `--references` take either.
- A class with several bases has one vtable per base, each printed with the offset of its base in the object. For
  `CSource2Client`, the `Source2Client002` interface is the one at offset 0.
- `--references` replaces `strings` and `objdump`: given a text, it finds the string containing it, then the
  instructions loading that string and the slot each one is in. Given a `0x` address, the vtable of a local class for
  example, it does the same for that address. The search tries every RIP-relative operand, so a hit reported in "code
  without unwind entry" may be bytes that only look like an operand.
- `--contains` is exact: functions are delimited by the unwind entries of `.pdata`, not guessed from the padding.
- `--raw-name` takes the decorated type name. For the lambda job of `FrameStageNotify`, the name is printed by
  `grep -aoE '\.\?AVCLambdaJob@[[:print:]]*FrameStageNotify@CSource2Client@@[[:print:]]*' client.dll`. The tool prints
  the vtable of that class, then `--references 0x<vtable address>` on `CSource2Client` gives slot 36.

To read more of a function than `--disas` prints, use `dumpbin` directly. It takes absolute addresses and resolves
RIP-relative operands to absolute ones. In PowerShell, since Git Bash rewrites the `/NOLOGO`-style switches into paths
(from Git Bash or zsh, put the commands in a `.ps1` file and run it with `powershell -ExecutionPolicy Bypass -File`):

```powershell
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$dumpbin = & $vswhere -latest -find 'VC\Tools\MSVC\**\bin\Hostx64\x64\dumpbin.exe' | Select-Object -Last 1
& $dumpbin /NOLOGO /DISASM /RANGE:0x180123450,0x180123500 'C:\path\to\client.dll'
```
