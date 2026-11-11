# CS2 server plugin

A library loaded into CS2 when the app starts the game. It connects to the CS:DM WebSocket server and listens for
messages that result in game actions, drives the demo playback from the files the app writes next to the demo, and
draws the in-game panels.

This file is the developer documentation, written for coding agents first. Read it before changing anything in this
folder, and before changing the app code that installs the plugin, writes its playback files or exchanges messages
with it.

Paths are relative to this folder, except `src/`, `static/`, `skills/` and `.github/`, which are at the repository
root. Mind the nesting: the sources are in `cs2-server-plugin/cs2-server-plugin/` from the repository root.

## Rules

**Never crash the game.** The plugin reads engine memory it doesn't own, through reverse engineered layouts that a CS2
update can change. A plugin bug must cost a feature, never the game:

- When something isn't where the plugin expects it, log it and skip the feature: the panel isn't drawn, the name isn't
  replaced, the playback goes on.
- Never dereference engine memory without checking it first (is the range readable, does the pointer look like one).
- Never call the engine from the WebSocket thread. A message handler queues the work (`QueueEngineCommand` and the
  like), the frame hook does it on the game thread.
- Prefer lookups by name to hardcoded offsets: field offsets are resolved from the game's schema at runtime, so they
  follow game updates.
- Quitting the game with an error dialog is only for the bootstrap, when the real server library, the cvar interface
  or the frame hook can't be obtained, since nothing in the plugin can work without them, and for a game started
  without `-insecure`, which must not run with the plugin loaded.

**Never commit locally built binaries.** Every build writes to tracked files in [`static/cs2/`](../static/cs2), so they
show as modified after building. Stage sources by path and leave `static/` out of commits. The committed binaries come
only from the "Build CS server binaries" GitHub workflow
([`.github/workflows/build_cs_plugins.yml`](../.github/workflows/build_cs_plugins.yml)), started by hand from the
Actions tab, which builds the three platforms and opens a pull request when they changed.

**Don't change the submodules in [`cs2-server-plugin/deps/`](cs2-server-plugin/deps)** (except to
[update the SDK](#updating-the-sdk)). [`deps/s2sdk/AGENTS.md`](cs2-server-plugin/deps/s2sdk/AGENTS.md) is for
contributing to the SDK upstream: its branch, cherry-pick and commit rules don't apply to this repository.

**Keep the sides in sync:**

- The default WebSocket port of the plugin must match [`src/server/port.ts`](../src/server/port.ts).
- A plugin binary only works with the Vulkan layer it was built with, see
  [Binaries for older CS2 builds](#binaries-for-older-cs2-builds).
- The vtable indexes must match the game, see [Verifying vtable indexes](#verifying-vtable-indexes).

## Before you're done

1. **Format** the C++ files you touched with clang-format **23**, the version pinned by `make format`, with the
   [`.clang-format`](.clang-format) of this folder. Other major versions format differently: the clang-format bundled
   with Visual Studio 2026 is 22, don't use it. See [Formatting](#formatting).
2. **Build** every platform you can, see [Building](#building). When one can't be built where you are (Linux from
   Windows, Windows from Linux), say so in your summary and review the code of that platform by reading it:
   `*_linux.cpp`, `*_windows.cpp`, the `#ifdef _WIN32`/`__linux__` blocks and
   [`vulkan-layer/`](cs2-server-plugin/vulkan-layer). The `CsdmOverlay*` exports of the layer, declared in
   [`vulkan-layer/vulkan_layer.h`](cs2-server-plugin/vulkan-layer/vulkan_layer.h), and the structs they pass must keep
   a plain C layout.
3. **Leave the binaries out** of the commit (see [Rules](#rules)).
4. **Commands and convars**: when you add or change one, tell the user to update the
   [CS2 console commands](https://cs-demo-manager.com/docs/guides/cs2-console-commands) page of the website, which
   lives in another repository. See [Commands and convars](#commands-and-convars).
5. **Test in the game**: start a playback with the CLI and check `csdm.log`, see
   [Testing a change](#testing-a-change). Hand the user what the log can't show (panels, camera, input), with the steps
   to check it, and report only what you verified as tested.
6. The usual repository checks (`vp check`, tests, i18n) apply to any TypeScript you changed on the app side, see the
   root [`AGENTS.md`](../AGENTS.md).

## Structure

```
cs2-server-plugin/              # This folder
  build.ps1                     # Windows build, see "Building"
  tools/                        # Reverse-engineering aid, see "Verifying vtable indexes"
  cs2-server-plugin/            # Sources
    *.cpp, *.h                  # Plugin sources
    commands/                   # One file per console command
    cvars/                      # One file per convar
    ui/                         # ImGui panels
    vulkan-layer/               # Vulkan layer drawing the panels on Linux
    protobuf/                   # Generated from the SDK .proto files, see "Network messages and protobuf"
    deps/                       # Deps submodules: s2sdk, imgui...
static/cs2/                     # Binaries the app installs into the game, built by the CI
```

## How it works

Unlike CS:GO, CS2 has no plugin system. The library is named like the game's own server library (`server.dll`,
`libserver.so`) and installed in a folder that the app adds to the search paths of `gameinfo.gi` ahead of the `csgo`
folder, so the game loads it in place of the real one. Its exported `CreateInterface` loads the real server library on
the first call and forwards every call to it, which keeps the game working as before. On the way, it patches the
vtable of `Source2ServerConfig001`:

- `Connect` is where the plugin starts, with the engine factory in hand. It fetches the cvar interface, registers the
  commands and convars, loads the settings, hooks `FrameStageNotify` of the client interface (`Source2Client002`),
  starts the WebSocket connection and restores `gameinfo.gi`. The client library isn't loaded yet at that point, the
  plugin loads it itself, and the engine gets the same module when it loads it later.
- `Shutdown` saves the settings and removes the overlay.

The frame hook is the plugin's game loop. CS:GO plugins got one from `IServerPluginCallbacks::GameFrame`, CS2 has no
plugin interface, and the engine is not safe to call from the WebSocket thread where the messages arrive. So the
plugin hooks `FrameStageNotify`, which the client calls on the game thread at every stage of every frame, and does
everything from there:

- On the first frame, it installs the overlay and the hook on the network messages. Both need the client up, so they
  can't be done from `Connect`.
- At `FRAME_START`, it runs everything periodic: the engine commands queued by the WebSocket thread, the sequences, the
  panels and so on.
- At each playback start, it sets `sv_cheats 1`.
- At `FRAME_RENDER_START`, it writes the replaced player names, after the game has reapplied the network update that
  would otherwise overwrite them.

Everything but the WebSocket thread runs on the game thread, which is why most of the state needs no lock.

## Requirements

- **Windows**: [Visual Studio 2026](https://visualstudio.microsoft.com/downloads/) with the component
  `Desktop development with C++`.
- **Linux**: `sudo apt install make build-essential g++ libvulkan-dev` (`vulkan-headers` on Arch), and Docker for the
  sniper build (see below).
- **Both**: clang-format 23, see [Formatting](#formatting).

Then fetch the submodules: `git submodule update --init --recursive`. The SDK is
[alliedmodders/s2sdk](https://github.com/alliedmodders/s2sdk), checked out in
[`cs2-server-plugin/deps/s2sdk`](cs2-server-plugin/deps/s2sdk), next to
[`easywsclient`](cs2-server-plugin/deps/easywsclient) (WebSocket client), [`json`](cs2-server-plugin/deps/json)
(nlohmann) and [`imgui`](cs2-server-plugin/deps/imgui).

## Building

### Windows

[`build.ps1`](build.ps1) finds the MSBuild of Visual Studio and builds the solution. The same command works from
PowerShell, cmd, Git Bash or zsh, in this folder (Windows doesn't run local scripts without `-ExecutionPolicy Bypass`):

```sh
powershell -ExecutionPolicy Bypass -File build.ps1 [-Configuration Debug]
```

A full build takes about 2 minutes, an incremental one a few seconds. The DLL is written to [`static/cs2/server.dll`](../static/cs2/server.dll).
Building from Visual Studio does the same, and Visual Studio may build `Debug` into the same path while open. The
`Debug|x64` configuration builds the same DLL with the reverse-engineering commands and the debug symbols, see
[Debugging](#debugging).

### Linux

`make build` in [`cs2-server-plugin/`](cs2-server-plugin) builds the plugin into
[`static/cs2/libserver.so`](../static/cs2/libserver.so) and the Vulkan layer into `static/cs2/libcsdm_vulkan_layer.so`
with the host toolchain. It links the host's glibc/libstdc++ symbol versions, so the result only loads on distros as
recent as the build machine, which is fine for debugging.

`make build-sniper` is the same build inside the Steam Runtime "sniper" SDK Docker image CS2 runs in, the one the
workflow uses, to test what the CI will ship. It needs Docker. To tell the two apart, from the repository root:

```sh
objdump -T static/cs2/libserver.so | grep -oP 'GLIBC_[0-9.]+' | sort -uV | tail -1
```

A sniper build prints `GLIBC_2.14` (plugin) or `GLIBC_2.29` (layer), a host build the host's glibc (`GLIBC_2.43` on
Ubuntu 26.04).

`make vulkan-layer` builds only the layer.

### Formatting

The sources are formatted with clang-format 23 and the [`.clang-format`](.clang-format) of this folder. `deps/` and
`protobuf/` are left untouched.

- **Linux**: `make format` in [`cs2-server-plugin/`](cs2-server-plugin). It looks for `clang-format-23`, then
  `clang-format`, and refuses any other major version. Install it from [apt.llvm.org](https://apt.llvm.org) or pass
  `CLANG_FORMAT=/path/to/clang-format`.
- **Windows**: there is no `make`, run the binary on the files you touched. The clang-format bundled with Visual Studio
  2026 is 22: install an LLVM 23 release from [GitHub](https://github.com/llvm/llvm-project/releases) instead, and
  check with `clang-format --version` before formatting.

### Binaries for older CS2 builds

A CS2 update can break the plugin while demos recorded before it still need the old build to play. The previous
binaries are kept as `server_<version>.dll` and `libserver_<version>.so` in [`static/cs2/`](../static/cs2) and
selectable from the playback settings (`CS2PluginVersion` in
[`src/common/types/cs2-plugin-version.ts`](../src/common/types/cs2-plugin-version.ts)). The procedure to freeze the
current build as such a version is the [`add-cs2-plugin-version`](../skills/add-cs2-plugin-version/SKILL.md) skill.

A plugin binary only works with the Vulkan layer it was built with: `dlsym` checks the exports exist, not the layout of
the structs passed to them nor the button bits the plugin forwards. When `libserver.so` is frozen as
`libserver_<version>.so`, freeze `libcsdm_vulkan_layer.so` as `libcsdm_vulkan_layer_<version>.so` too. The app
installs the layer matching the selected version, and none for versions that have no layer.

## Installation

The app [installs](../src/node/counter-strike/launcher/cs2-server-plugin.ts) the plugin every time it starts CS2:

1. The binary is copied from [`static/cs2/`](../static/cs2) to `game/csgo/csdm/bin/` (Windows) or
   `game/csgo/csdm/bin/linuxsteamrt64/` (Linux) in the game folder. On Linux the Vulkan layer and its manifest go to
   `game/csgo/csdm/vulkan/`.
2. `game/csgo/gameinfo.gi` is backed up as `gameinfo.gi.backup` and a search path for the plugin folder is added ahead
   of the game's own, which makes the game load the plugin's `server` library instead of its own (see
   [How it works](#how-it-works)):

```diff
SearchPaths
{
	Game_LowViolence	csgo_lv // Perfect World content override

+	Game	csgo/csdm
	Game	csgo
	Game	csgo_imported
	Game	csgo_core
	Game	core
```

3. CS2 is started with the launch option `-insecure`, which the plugin checks for at startup.

### Uninstallation

The plugin restores `gameinfo.gi` from the backup itself when the game starts, so a crash or a game started outside the
app doesn't leave the search path behind. The app also restores the file and deletes the plugin folder when the game
closes.

## Logging

Logs are printed in the CS2 console with the prefix `CSDM` and written to `csdm.log` next to the game
executable: `game/bin/win64/` on Windows, `game/bin/linuxsteamrt64/` on Linux. The Vulkan layer writes its own
`csdm-vulkan.log` in the same folder. The app deletes both files when it starts the game.

On Windows, starting the game with the `-tools` launch option gives access to the
[VConsole](https://developer.valvesoftware.com/wiki/Valve_Console), which filters the logs.

## Testing a change

The CLI starts a playback without the app UI, so an agent can run the game and read the plugin log itself. From the
repository root:

1. Build (any configuration, they all write to [`static/cs2/`](../static/cs2)).
2. Start `vp run dev:cli` in the background. It builds the CLI into `out/cli.js` and the server daemon into
   `out/server.js`, and rebuilds them on change.
3. `node out/cli.js watch <demo.dem> [--tick <tick>] [--focus-player <steamId>] [--exec <tick>:<command>]...` starts
   CS2 on the demo with the playback settings of the dev app. Steam must be running. It returns when the game closes,
   or right away when a game is already running, which then gets the demo instead.
4. Read `csdm.log` (see [Logging](#logging)) for the lines that prove the change works. The log is the only output of
   the game an agent can read: when a change has no visible trace in it, log what it does.

`--exec` drives the game without the console. Each one adds an action to the [actions file](#playback-files): the
plugin runs the command when the playback reaches the tick and logs `[<tick>] Executing: <command>`. A command that
logs through the plugin, like `csdm_info` or the `csdm_dump_*` commands, writes its output to `csdm.log`. End with a
`quit` so the game closes and `watch` returns, the app then restores `gameinfo.gi`:

```sh
node out/cli.js watch demo.dem --tick 12000 --exec 12100:csdm_info --exec "12200:csdm_dump_net_messages 600" --exec 12300:quit
```

- A command only runs while the demo plays. A tick past the end of the demo, or reached while the playback is paused,
  never runs, and the game stays open: close it with `Stop-Process -Name cs2` in PowerShell (`taskkill //IM cs2.exe` from
  Git Bash), `pkill cs2` on Linux.
- Ticks the playback skips still run their commands, at the next tick it reaches: a command before `--tick` runs
  right after the seek. Ticks before 96 are moved to 96, the game may skip the first ticks of a demo.
- The `csdm_dump_*` commands only exist in dev builds (`Debug|x64`, `make DEV_COMMANDS=1 build`).
- The timeline and cameras files come from the database: the `csdm_demo_goto_*` commands need an analyzed demo, the
  `csdm_camera*` commands cameras for its map. `csdm.log` says what was loaded (`Timeline loaded: ...`,
  `Cameras loaded: ...`).

Ask the user before starting the game when CS2 is already running, it may be their own session.

Whatever starts the game, the app or the CLI, installs what is in `static/cs2/` for the plugin version selected in the
playback settings (`playback.cs2PluginVersion` in `~/.csdm-dev/settings.json` on Windows,
`~/.config/csdm-dev/settings.json` on Linux): make sure it is the latest one, otherwise a frozen
`server_<version>.dll` is installed and the new build never loads.

The user is still needed for what only shows on screen or needs input: the panels, the camera, the mouse and
keyboard. Give them the steps that exercise the change and what to look for. They can also start the playback from
the app: `vp run dev` at the repository root.

The app passes its WebSocket port to the game through the `CSDM_WS_PORT` environment variable, so a dev instance
running on another port than an installed app still gets its own plugin connection.

## Playback files

The app writes JSON files next to the demo before starting the playback, which the plugin reads when the game starts
with `+playdemo` and on every `playdemo` message. For `~/myDemo.dem`:

- `~/myDemo.dem.json`, the **actions file**, a list of sequences, each a list of actions executed at a tick. It is
  generated by
  [`json-actions-file-generator.ts`](../src/node/counter-strike/json-actions-file/json-actions-file-generator.ts).
  It plays the role VDM files had in CS:GO.

  ```ts
  type Action = {
    tick: number; // Tick at which the command is executed
    cmd: string; // Game command, for example `demo_gototick 123`
  };
  ```

- `~/myDemo.dem.timeline.json`, the rounds, kills and highlights shown by the playback panel timelines and used by the
  `csdm_demo_goto_*` commands.
- `~/myDemo.dem.cameras.json`, the cameras of the map for the `csdm_camera*` commands.

The timeline and cameras files are optional, they are written by
[`write-playback-files.ts`](../src/node/counter-strike/json-actions-file/write-playback-files.ts) in the same folder as
the generator. The app deletes the files once the plugin reports it loaded them.

## WebSocket messages

A background thread connects to `ws://localhost:<port>?process=game` and reconnects when the connection drops. The
port comes from the env variable `CSDM_WS_PORT`, with a default that must stay in sync with
[`src/server/port.ts`](../src/server/port.ts). Messages are JSON objects with a `name` and an optional `payload`.

The names and payload types are declared in
[`src/server/messages/game-server-message-name.ts`](../src/server/messages/game-server-message-name.ts) and
[`game-client-message-name.ts`](../src/server/messages/game-client-message-name.ts), the server-side handlers are in
[`src/server/handlers/game-process/`](../src/server/handlers/game-process). The
[`process-communication`](../skills/process-communication/SKILL.md) skill explains how to add a message.

## Commands and convars

All are prefixed `csdm_` and declared one per file in [`commands/`](cs2-server-plugin/commands) and
[`cvars/`](cs2-server-plugin/cvars). The help string is the reference documentation of a command, keep it short: the
console drops lines past ~256 characters. The user-facing list is the
[CS2 console commands](https://cs-demo-manager.com/docs/guides/cs2-console-commands) page of the website, which must be
updated when adding or changing one. The `csdm_dump_*` commands only exist in dev builds, see
[Verifying vtable indexes](#verifying-vtable-indexes).

## Network messages and protobuf

Some data the plugin needs is only available in the network messages of the demo, for example the players' button
masks, only sent in `CSVCMsg_UserCommands`. The plugin reads those messages by hooking their unserialization.

The protobuf classes come from the generated sources in [`cs2-server-plugin/protobuf/`](cs2-server-plugin/protobuf),
built from the `.proto` files vendored in the SDK with the protoc it also ships (3.21.8, the version the game itself
uses):

```sh
cd cs2-server-plugin
SDK=deps/s2sdk
./$SDK/devtools/bin/protoc.exe \
  --proto_path=$SDK/common \
  --proto_path=$SDK/game/shared \
  --proto_path=$SDK/game/shared/cs \
  --proto_path=$SDK/thirdparty/protobuf-3.21.8/src \
  --cpp_out=protobuf \
  valveextensions.proto network_connection.proto networkbasetypes.proto source2_steam_stats.proto \
  netmessages.proto usercmd.proto cs_usercmd.proto
```

Use `$SDK/devtools/bin/linux/protoc` on Linux. Regenerate them after updating the SDK.

The generated classes are never cast onto the objects built by the game: protobuf lays the members of a class out by
type rather than by field number, so a field Valve adds moves the ones after it. The plugin serializes the game's
object through its own virtuals and parses the bytes into the generated class instead. That works with game builds
from before and after a field is added, whether the SDK has it yet or not. Only the protobuf version has to match,
since the plugin calls the `MessageLite` virtuals of the game's objects.

The plugin links the protobuf runtime shipped with the SDK (`lib/public/win64/2015/libprotobuf.lib` and
`lib/linux64/release/libprotobuf.a`). That library is built against the static CRT, which is why the Windows project
uses `/MT` rather than `/MD`, and against the pre C++11 libstdc++ ABI, which is why the Makefile defines
`_GLIBCXX_USE_CXX11_ABI=0`.

## Verifying vtable indexes

The plugin hooks and calls several engine interfaces by raw vtable index: the methods declared in
[`cs2-server-plugin/cdll_interfaces.h`](cs2-server-plugin/cdll_interfaces.h), whose slot is noted in a comment next to
each, and the index constants next to the hooks. The indexes follow the declaration order of the SDK headers, which
are reverse engineered. A CS2 update can add, remove or reorder virtuals, so after an update, or whenever a hook
misbehaves, check them against the shipped binary. The
[`support-cs2-update`](../skills/support-cs2-update/SKILL.md) skill lists every index and walks through the check.

[`tools/dump-vtable.py`](tools/dump-vtable.py) finds the vtable of a class in a Linux binary through its RTTI and
prints every slot:

```sh
./tools/dump-vtable.py "$HOME/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/bin/linuxsteamrt64/libnetworksystem.so" CNetworkMessages --disas 4
```

Verifying on Linux covers Windows as long as no destructor sits between slot 0 and the index: MSVC gives a virtual
destructor one slot and the Itanium ABI two. For an interface that declares its destructor before the methods the
plugin uses, the Linux slots are one higher than the Windows ones. For example `IDemoPlayer` declares it at the top,
so the slots noted in `cdll_interfaces.h` are Windows slots, add one when reading them against a Linux binary. MSVC
also groups the overloads of a virtual method next to each other in reverse order, so an interface with overloaded
virtuals has to be checked on both platforms.

[`tools/dump-vtable-windows.py`](tools/dump-vtable-windows.py) is its counterpart for the Windows DLLs, through the MSVC
RTTI:

```sh
py -3 tools/dump-vtable-windows.py "C:/Program Files (x86)/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/bin/win64/server.dll" CSource2GameClients --references player_connect_full
```

The `csdm_dump_net_messages` and `csdm_dump_demoplayer_vtable` console commands are the runtime counterpart: they
print what the plugin resolves through the indexes, and garbage names or a crash there means an index moved. They are
left out of the shipped plugin and built in by the `Debug` configuration on Windows and `make DEV_COMMANDS=1 build` on
Linux (see [Debugging](#debugging)).

[`tools/README.md`](tools/README.md) explains what the tool needs, how to get the Linux binaries from Windows, how to
match the slots it prints to SDK methods and how to read a vtable in the Windows binaries: anchoring a method by a
string it references, by the local class of a lambda it queues, or by the members and globals it shares with its
neighbors.

## Overlays

The panels are ImGui windows drawn on top of the game. How they get in front of the frames the game presents depends
on the platform:

- **Windows**: the plugin patches the vtable of `IDXGISwapChain`, which lives in `dxgi.dll` and is shared by every
  swap chain of the process, so it is enough to hook the one of a throwaway swap chain. The throwaway swap chain must
  not be created through `IDXGIFactory::CreateSwapChain` (which `D3D11CreateDeviceAndSwapChain` calls): HLAE keeps a
  pointer to the last swap chain created that way. The panels are drawn when `Present` is called, too late for the
  frames recorded in videos:
  - The game's movies (`startmovie`) and screenshots copy the frame into a staging texture the size of the screen and
    map it before `Present`. The plugin hooks `ID3D11DeviceContext::Map` and draws the panels into that texture just
    before the game reads it, except while it captures the player view for a camera preview. The game renders on
    deferred contexts, only the final steps (`Map`, binding the back buffer) go through the immediate context.
  - HLAE records from the game's own frame render target, not from the back buffer, so when HLAE is loaded the panels
    are also drawn into that render target, the one still bound when `Present` is called, and `Map` isn't hooked.
- **Linux**: CS2 renders through Vulkan. The game resolves its functions with
  `vkGetInstanceProcAddr`/`vkGetDeviceProcAddr` into a table of its own at startup, before the plugin is loaded, so
  there is nothing left to patch. The panels are drawn by a Vulkan layer instead, built from
  `cs2-server-plugin/vulkan-layer/` into `libcsdm_vulkan_layer.so`. The app installs it next to the plugin as an
  implicit layer. When it starts the game, it adds the manifest folder to the search path of the Vulkan loader and
  sets the variable the manifest enables the layer with. The plugin finds the loaded layer with
  `dlopen(RTLD_NOLOAD)` and pushes what to draw into it. The layer uses no game internals (no SDK, offsets or
  vtables) and doesn't link the Vulkan loader: everything it calls comes from the layer chain.

Mouse and keyboard reach ImGui from the window procedure on Windows and from an SDL event filter the plugin installs
on Linux. While a text field has the keyboard, the keys are kept from the game.

Every panel is drawn at a size proportional to the resolution, 1080p being the reference. What the panels do and
the commands that control them are documented in the
[CS2 console commands](https://cs-demo-manager.com/docs/guides/cs2-console-commands) page of the website.

### Settings

The plugin keeps the overlay settings across game sessions in `game/csgo/cfg/csdm_settings.json`. The config keys are
the names of the convars that change them. Deleting the file puts everything back to its defaults.

The position of each panel is a convar holding fractions of the screen size, kept up to date as the panel is dragged.

## Updating the SDK

After a CS2 update, use the [`support-cs2-update`](../skills/support-cs2-update/SKILL.md) skill, which includes these
steps.

1. `git submodule update --remote cs2-server-plugin/deps/s2sdk`
2. Regenerate the [protobuf files](#network-messages-and-protobuf).
3. Rebuild on both platforms and [verify the vtable indexes](#verifying-vtable-indexes) the plugin relies on.

## Debugging

### Windows

The `Debug|x64` configuration builds [`static/cs2/server.dll`](../static/cs2/server.dll) like `Release` does, so the
app installs it into the game when it starts it, but without optimizations, with `server.pdb` kept next to the DLL and
with the reverse-engineering commands above. It links the same release `libprotobuf.lib` as `Release`, which is why it
keeps the release static CRT (`/MT`) and doesn't define `_DEBUG`.

To hit breakpoints: build `Debug`, start a playback from the app (it starts the game with `-insecure`, so VAC doesn't
get in the way), then in Visual Studio use Debug > Attach to Process on `cs2.exe` with the _Native_ code type. The
debugger finds `server.pdb` through the path stored in the DLL, so breakpoints in the plugin sources bind as soon as
the game loads the plugin, and can be set before attaching. The plugin log (`csdm.log`, next to `cs2.exe`) stays the
quickest way to trace the plugin without pausing the game.

Attaching is too slow for breakpoints at game bootstrap, for instance in the first `CreateInterface` call. For those,
set `CSDM_WAIT_FOR_DEBUGGER=1` in the environment of the shell running `vp run dev`: the app forwards its environment
to the game, and a `Debug` plugin finding that variable stalls its first `CreateInterface` call until a debugger is
attached, then breaks into it. Attach when the game window is up, and every breakpoint set before that is hit from
there on. The stall is unconditional as long as the variable is set, so unset it once done.

### Linux

`make DEV_COMMANDS=1 build` is the counterpart of the `Debug` configuration: it builds the reverse-engineering commands
in and adds the debug symbols (`-g`) gdb needs to show the plugin sources. The plugin is never optimized, so that
build is otherwise the shipped one.

Attaching works the same way, `gdb -p $(pidof cs2)` once the game is up, and so does the bootstrap wait:
`CSDM_WAIT_FOR_DEBUGGER=1 vp run dev`, then attach while the plugin spins, which it detects through the `TracerPid`
of `/proc/self/status`. It then raises `SIGTRAP`, which gdb reports as a stop: set the breakpoints and `continue`.
Attaching to a process that isn't a child of gdb requires `/proc/sys/kernel/yama/ptrace_scope` to be `0`, or running
gdb as root.

### VS Code

The "Attach to CS2 plugin" [launch configurations](../.vscode/launch.json) of the repository do the same from VS Code,
with the C/C++ extension (`ms-vscode.cpptools`): pick `cs2` in the process list they open. The Windows one uses the
Visual Studio debugger engine, the Linux one drives gdb and asks for the path of the `cs2` executable, prefilled with
the default Steam location. Both work with `CSDM_WAIT_FOR_DEBUGGER`, which can also be set for the app started from
the "Debug app" configuration by adding an `env` entry to it.
