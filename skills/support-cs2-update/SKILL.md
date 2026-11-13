---
name: support-cs2-update
description: Make the CS2 plugin work again after a CS2 update breaks playback. Triages the plugin log, freezes the previous build, updates the SDK and protobuf files, and re-verifies every vtable index the plugin relies on against the new game binaries. Use when a CS2 update breaks the plugin (crash at start, playback controls or panels not working, garbage in the log), when asked to verify the vtable indexes, or when updating the s2sdk submodule.
user-invocable: true
---

## Why

The plugin calls the engine through reverse engineered interfaces, by raw vtable index. A CS2 update can add, remove
or reorder virtuals, bump an interface version, or change the network messages, and the plugin then calls the wrong
method. Most past fixes were a shift of one or two slots in `cdll_interfaces.h` plus an SDK update.

Read [`cs2-server-plugin/AGENTS.md`](../../cs2-server-plugin/AGENTS.md) first: its rules and checklist apply to every
step below. Paths here are relative to the repository root.

## Inputs to gather

1. **What breaks**: reproduce it with the CLI (`node out/cli.js watch <demo.dem>`, see "Testing a change" in
   `AGENTS.md`) and read `csdm.log` (next to the game executable) and the minidump (`*.mdmp` in `game/bin/win64/`) if
   the game crashed. Ask the user for what only shows on screen.
2. **The new CS2 build**: its `PatchVersion` from `game/csgo/steam.inf`, and the update commit in
   [GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2), which diffs the strings, protobufs and
   binaries between builds.
3. **The game binaries** of the new build, Linux ones for `dump-vtable.py` (see the Requirements of
   [`tools/README.md`](../../cs2-server-plugin/tools/README.md) to get them from Windows), Windows ones for
   `dump-vtable-windows.py`.

## Steps

### 1. Triage

Rule out a stale plugin first. The dev app installs the plugin version selected in **Settings > Playback**, stored as
`playback.cs2PluginVersion` in the app folder's `settings.json` (`~/.csdm-dev` on Windows, `~/.config/csdm-dev` on
Linux). A frozen version left selected from an earlier test looks like a fresh breakage. The
minidump module list names the loaded `csgo/csdm/bin/server.dll` with its PE timestamp, which identifies the build.
Then read the log against the current sources:

| Symptom in the log or game                                   | Likely cause                     | Step |
| ------------------------------------------------------------ | -------------------------------- | ---- |
| `<interface> not found`, error dialog at start               | Interface version bumped         | 3    |
| Crash or garbage right after a hook installs, wrong commands | Vtable index moved               | 4    |
| Button or voice panels empty, message hook logs errors       | Message id or protobuf changed   | 3, 4 |
| `Schema: <class>::<field> not found`                         | Field renamed in the game schema | code |

Not every breakage is in the plugin: demo analysis (`@akiver/cs-demo-analyzer`), voice extraction, map detection and
HLAE video recording break on their own after updates. Check the git log for past "since the CS2 update" fixes.

### 2. Freeze the previous build

Demos recorded before the update need the previous plugin to play. Run the
[`add-cs2-plugin-version`](../add-cs2-plugin-version/SKILL.md) skill. It takes the binaries from git, so it doesn't
depend on the fix and can be done first, in its own commit.

### 3. Update the SDK and the protobuf files

Follow "Updating the SDK" in `AGENTS.md`: update the `s2sdk` submodule, regenerate the protobuf files, then rebuild.
Compile errors there are API changes, fix the plugin code, never the submodule.

After the update, compare the message ids in
[`net_messages.cpp`](../../cs2-server-plugin/cs2-server-plugin/net_messages.cpp) (`userCmdsMessageId`,
`voiceDataMessageId`) with the `SVC_Messages` enum of `netmessages.proto`.

### 4. Verify every vtable index

Every raw index the plugin uses that a CS2 update can move:

| Where                                         | Index                              | Interface                   | Implementation class, library     |
| --------------------------------------------- | ---------------------------------- | --------------------------- | --------------------------------- |
| `main.cpp`, `CreateInterface`                 | 0 `Connect`, 4 `Shutdown`          | `Source2ServerConfig001`    | real server library               |
| `main.cpp`, `frameStageNotifyVtableIndex`     | 36 `FrameStageNotify`              | `Source2Client002`          | `CSource2Client`, client          |
| `net_messages.cpp`, `*VtableIndex`            | 3 `UnserializeMessageInternal`, 20 | `NetworkMessagesVersion001` | `CNetworkMessages`, networksystem |
| `cdll_interfaces.h`, `ISource2EngineToClient` | the `//:` comments                 | `Source2EngineToClient001`  | `CEngineClient`, engine2          |
| `cdll_interfaces.h`, `IDemoPlayer`            | the `//:` comments (Windows slots) | from `GetDemoPlayer`        | `CDemoPlayer`, engine2            |

The DXGI indexes of `overlay_windows.cpp` are a COM ABI, not CS2's: they never move.

`net_messages.cpp` hooks slots 3 and 20 by index but calls the other `INetworkMessages` methods it needs through the
SDK declaration (`FindNetworkMessagePartial` 10, `AllowAdditionalMessageRegistration` 22,
`IsAdditionalMessageRegistrationAllowed` 23, `FindNetworkMessageById` 27): check the SDK's `inetworkmessages.h` against
the binary too, it may lag behind the game. Until the SDK catches up, call the slots that moved by index, like the
hooks. The typedefs of the two hooks copy the SDK signatures, check the arguments of those methods as well.

For each interface:

1. Dump the vtable of the implementation class from the new Linux binary with
   [`dump-vtable.py`](../../cs2-server-plugin/tools/dump-vtable.py), or from the Windows DLL with
   [`dump-vtable-windows.py`](../../cs2-server-plugin/tools/dump-vtable-windows.py). Check the slot count against the
   declaration first: a changed count says virtuals were added or removed, and the destructor slots are a landmark
   (two on Linux, one on Windows).
2. Match the slots the plugin uses to methods with the techniques of
   [`tools/README.md`](../../cs2-server-plugin/tools/README.md): small methods by their instructions, big ones by a
   string they reference, `FrameStageNotify` by its lambda job class, neighbors by shared members and globals. Where
   the code comments how an index was anchored, re-anchor it the same way.
3. Convert to Windows slots where it applies: MSVC gives a virtual destructor one slot where Linux has two, and groups
   overloads in reverse order. An interface with overloaded virtuals is checked in the Windows binary too, see the
   last section of `tools/README.md`.
4. Compare with the previous build when unsure: the same dump on the old binary shows which slots shifted, and by
   how much.

[advancedfx](https://github.com/advancedfx/advancedfx-prop) (HLAE) maintains its own `cdll_int.h` for CS2, the origin
of `cdll_interfaces.h`. Its history after the same update is a useful second opinion, never a substitute for checking
the binary.

### 5. Update the code

- In `cdll_interfaces.h`, keep one declaration per slot: move the method and fill the gap with `_Unknown_NNN`
  placeholders, numbered by slot, and update its `//:` comment. `IDemoPlayer` comments stay Windows slots.
- Update the index constants and their comments, and say how a new index was anchored, so the next update can
  re-check it the same way.
- Keep the [never crash the game](../../cs2-server-plugin/AGENTS.md#rules) rules: a lookup that can fail logs and
  disables the feature.

### 6. Build and check in the game

Run the "Before you're done" checklist of `AGENTS.md` (format, build, binaries left out). Then check the fix in the
game yourself with a dev build (`Debug|x64` on Windows, `make DEV_COMMANDS=1 build` on Linux) and the CLI, as
described in "Testing a change" of `AGENTS.md`:

```sh
node out/cli.js watch <demo.dem> --tick 12000 --focus-player <steamId> \
  --exec 12100:csdm_info \
  --exec 12200:csdm_dump_demoplayer_vtable \
  --exec "12300:csdm_dump_net_messages 600" \
  --exec "12400:demo_timescale 2" \
  --exec 12600:csdm_demo_goto_next_round \
  --exec 13000:quit
```

Pick ticks inside the demo, and an analyzed demo: `--focus-player` and the round jump need it. After the jump, the
`quit` tick is behind the playback and runs on the next tick. Then read `csdm.log`:

- The bootstrap gets through: interfaces found, hooks installed, schema fields resolved, playback files loaded.
- `csdm_dump_net_messages` prints the message names with their ids (`Message 76: CSVCMsg_UserCommands [76]`):
  garbage or a crash means a `NetworkMessagesVersion001` index is wrong, and the ids must match the message id
  constants. `csdm_dump_demoplayer_vtable` prints `engine2.dll+0x...` offsets, not names: match them against
  `dump-vtable-windows.py <engine2.dll> CDemoPlayer`, which prints the same offsets (see the Windows section of
  `tools/README.md`). A crash leaves a minidump in
  `game/bin/win64/`.
- `csdm_info` reports the hooks and the button masks of every slot, which come from the user commands message.
- Every `[<tick>] Executing:` line is followed by the effect the command should have, and nothing logs garbage.

Check the console command names against `commands/` before using them. Then give the user what only shows on screen:
the cameras, the player names, the panels (buttons, voice indicator), on both platforms when possible.

### 7. Commit

Sources only, with the date of the update, as in the history:

```
fix: support for the <DD/MM/YYYY> CS2 update
```

The binaries come later from the "Build CS server binaries" workflow, which the user starts.
