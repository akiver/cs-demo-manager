# Custom Build and Localization Notes

This document records local customization details that are easy to forget when switching between the installed app and
the custom repository build.

## Custom App Identity

The custom build is intentionally separate from the official installed app:

- Product name: `CS Demo Manager Custom`
- Executable name: `cs-demo-manager-custom.exe`
- App ID: `com.heavenkaras.csdm.custom`
- Window title: `CS Demo Manager CUSTOM`

Relevant files:

- `electron-builder.config.mjs`
- `src/common/app-identity.ts`
- `src/ui/renderer.tsx`
- `src/ui/title-bar/title-bar.tsx`
- `src/ui/settings/about/about.tsx`
- `src/electron-main/create-tray.ts`
- `src/electron-main/main.ts`
- `src/electron-main/system-startup-behavior.ts`

## Current Preview Build

Latest local preview build:

`dist-custom/player-grenades-tables-zh-preview/cs-demo-manager-custom.exe`

The preview build uses the existing custom `win-unpacked` Electron shell and replaces only
`resources/app.asar` with the current `out` bundle. This avoids overwriting the installed official app and avoids
network access during packaging.

Manual preview packaging flow used on 2026-07-08:

1. Run `vp run build`.
2. Run `vp run i18n:patch-zh-cn`.
3. Verify the generated `out` zh-CN renderer chunk has the same keys as the English chunk.
4. Copy `out` plus `package.json` into a temporary app-asar folder under `dist-custom`.
5. Run `asar pack` into `dist-custom/player-grenades-tables-zh-preview/resources/app.asar`.

Why this was needed:

- `vp run package --dir --publish never` tried to reach the network and was blocked by the sandbox.
- Repacking `app.asar` is enough for renderer, main, preload, server, and CLI JavaScript changes.
- The existing custom shell already has the custom executable name and app identity.

## Language Diagnosis

The app setting persisted correctly:

- Settings file: `C:\Users\Karas\.csdm\settings.json`
- Value checked: `settings.ui.locale = "zh-CN"`

The restart did not appear to apply Chinese because the local repository build did not have real Crowdin translations.
After `vp run i18n:extract`, local non-English catalogs exist but are empty:

- `src/ui/translations/zh-CN/messages.po`
- `src/electron-main/translations/zh-CN/messages.json`

The build script prints this when no Crowdin token exists:

`CROWDIN_PERSONAL_TOKEN is not set, skipping translations download. The build will only include English.`

For the preview exe, `scripts/patch-zh-cn-from-installed-app.mjs` merges Simplified Chinese resources from the already
installed official app:

- Installed source: `C:\Users\Karas\AppData\Local\Programs\cs-demo-manager\resources\app.asar`
- Renderer target example: `out/assets/messages-BLYSqNEi.js`
- Main-process target: `out/translations/zh-CN/messages.json`

The script uses the current English renderer chunk as the key source, then fills each key in this order:

1. Manual translations for custom strings added in this fork.
2. Official installed Simplified Chinese translations.
3. English fallback for current-version strings that are not present in the installed app.

It also normalizes old Lingui message IDs that use `+` and `/` into the current `-` and `_` form. Without this, settings
labels such as `HSh8u_` can appear as raw IDs even though the installed app has the matching translation under the old
ID shape.

Latest patch result:

- Renderer messages: 1807 total, 1729 official, 67 manual, 11 English fallback.
- Main-process messages: 62 total.
- Verification: English and zh-CN renderer chunks have matching key counts, 0 missing keys, and 0 values equal to their
  raw ID.

## Long-Term Localization Options

Preferred long-term fix:

- Configure `CROWDIN_PERSONAL_TOKEN`.
- Run `vp run build` so official translations are downloaded normally.

Local-only fallback:

- Keep using the installed official app as a source for existing translated chunks.
- Accept that newly added custom strings will display in English until they are translated upstream or manually handled.

Do not commit non-English catalogs from local extraction. The repository convention is to commit only English source
catalogs; other locales are managed by Crowdin.

## Git Hygiene

Ignored generated/local folders:

- `.pnpm-store`
- `dist-custom`

When adding a custom feature, commit source and documentation together or in adjacent commits so future lookup starts
from docs first, then follows the code map.
