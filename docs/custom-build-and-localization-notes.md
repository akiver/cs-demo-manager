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
2. Copy the installed official Simplified Chinese renderer chunk into the generated `out` zh-CN chunk.
3. Copy the installed official Simplified Chinese main-process `messages.json` into `out/translations/zh-CN`.
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

For the preview exe, the Simplified Chinese resources were copied from the already installed official app:

- Renderer source chunk:
  `dist-custom/installed-asar-inspect/assets/messages-fcCENWFC.js`
- Main-process source JSON:
  `dist-custom/installed-asar-inspect/translations/zh-CN/messages.json`

The current build's zh-CN renderer target was:

- `out/assets/messages-vx8JQGiM.js`

Verification after grafting:

- Renderer `Overview` resolves to the official Simplified Chinese translation.
- Renderer `Application language` resolves to the official Simplified Chinese translation.
- Main-process `menu.preferences` resolves to the official Simplified Chinese translation.

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
