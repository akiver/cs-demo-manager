---
name: add-cs2-plugin-version
description: Freeze the current CS2 plugin build as a selectable older version after a CS2 update breaks it. Snapshots the Windows plugin, the Linux plugin and the Linux Vulkan layer binaries, adds the version entry and its settings UI text. Use when asked to freeze or add a CS2 plugin version, or from step 2 of support-cs2-update. For a CS2 update that broke playback, start with support-cs2-update instead.
user-invocable: true
---

## Why

Demos only play on the CS2 build they were recorded with. When a CS2 update changes offsets or the protocol, the
plugin is fixed for the new build and the previous build is kept as a selectable version in
**Settings > Playback > CS2 plugin version**. To watch their old demos, users run a matching CS2 build, either from a
Steam beta branch or from an old build downloaded with `download_depot` and set in **Settings > Playback > CS2
location**, and select that version. See the
[playback guide](https://cs-demo-manager.com/docs/guides/playback#watching-old-cs2-demos).

A version is three binaries in `static/cs2/` taken from the **same build**:

| File                                | What                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| `server_<version>.dll`              | Windows plugin                                                  |
| `libserver_<version>.so`            | Linux plugin                                                    |
| `libcsdm_vulkan_layer_<version>.so` | Linux Vulkan layer that draws the overlays, see `vulkan-layer/` |

The layer compiles the panel code in and takes structs from the plugin, so it only works with the plugin it was built
with. `src/node/counter-strike/launcher/cs2-server-plugin.ts` installs the pair by name; versions without a layer file
(the ones that predate it) get no layer. **Never** backfill a layer for those or mix a layer and a plugin from
different builds.

## Inputs to gather

1. **Version number**: the `PatchVersion` of the last CS2 build the current plugin works with, without dots
   (`1.41.6.8` → `14168`). It comes from `game/csgo/steam.inf` of that build. The
   [GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2) history of `steam.inf` gives it, keep the link
   of the breaking update's commit for the comment.
2. **Dates**: the day of the breaking update and the lower bound, which is the upper bound of the previous version
   (reuse its date constant in the UI). Note the update name if Valve gave one ("Armory", "Animgraph 2"...).
3. **Beta branch**: if Valve publishes a Steam beta branch for the frozen build (e.g. `1.40.8.8`), its name goes in the
   UI text so users who don't use a downloaded build know what to select.
4. **Commit holding the compatible binaries**: the last commit before the CI "chore: update CS server binaries" pull
   request that brings the fixed plugin, usually the `main` head at the time the update shipped.

## Steps

### 1. Snapshot the binaries

Take them from git, never from a local build (a local build differs from the CI one and the three files must come from
the same build):

```sh
git show <sha>:static/cs2/server.dll > static/cs2/server_<version>.dll
git show <sha>:static/cs2/libserver.so > static/cs2/libserver_<version>.so
git show <sha>:static/cs2/libcsdm_vulkan_layer.so > static/cs2/libcsdm_vulkan_layer_<version>.so
```

If the working tree still has the compatible binaries, `cp` does the same. Nothing registers them: the installer
resolves them by name and `electron-builder.config.mjs` bundles `static/` by glob, filtering per platform.

### 2. Add the version entry

In `src/common/types/cs2-plugin-version.ts`, add the key before `latest`, ascending, with the same comment format as
the previous ones: the supported range and the GameTracking link.

```ts
  // Support between the <lower bound> update and the <date> update (<PatchVersion with dots>).
  // https://github.com/SteamTracking/GameTracking-CS2/commit/<sha>
  '<version>': '<version>',
  latest: 'latest',
```

### 3. Add the settings UI text

In `src/ui/settings/playback/cs2-plugin-select.tsx`:

- Add a date constant for the breaking update next to the others, e.g. `const update<version> = formatDate('YYYY-MM-DD', dateOptions);`.
- Add a `case PluginVersion[<version>]` **right before `default`**, as a complete `case` + `return` block. Don't insert
  between an existing `case` and its `return`, it shifts every text to the wrong version.
- The text is "You selected a version compatible with CS2 from the {lowerBoundDate} update up to the {update<version>}
  update." with a second paragraph for the beta branch when there is one ("If not using a custom build, you must
  select the CS2 beta branch..."). Copy an existing case. Strings use the `Trans`
  macro, see the `/i18n` skill.
- The previous version's text doesn't change: its upper bound is already the update that froze it.

### 4. Extract strings

```sh
vp run i18n:extract
```

Commit only `src/ui/translations/en/messages.po`.

### 5. Validate

```sh
vp check
vp run test
vp run deadcode
```

### 6. Commit

One commit with the three binaries, the two source files and the English catalog:

```
feat(playback): add CS2 plugin version <version>
```

## Afterwards

- A frozen version is immutable. If a fix must reach one, rebuild **both** Linux binaries from a branch off the commit
  the version came from and replace both files, never only the layer or only the plugin.
