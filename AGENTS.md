# Repository Guidelines

## Project

CS Demo Manager is a cross-platform Electron desktop application and CLI for analyzing Counter-Strike (CS2 / CS:GO)
demo files. It parses demos and stores data in PostgreSQL. Features include match/player/team statistics, graphs, a 2D
round viewer, heatmaps, video generation, demo downloads from Valve and third-party services, XLSX/JSON export, ban
tracking, voice audio extraction, and more.

This fork is used for local custom data views and analysis workflows. Keep changes small, well documented, and easy to
rebase onto `akiver/cs-demo-manager`.

## Stack

Important: this project uses Vite+ (`vp`). Always use `vp` instead of `pnpm` to manage dependencies and run scripts.
The `vp` CLI must be installed; see the Vite+ documentation.

- Desktop framework: Electron.
- Languages: TypeScript for the app/CLI, C++ for CS2/CS:GO plugins and Node.js native addons.
- UI: React, Redux Toolkit, React Router, Tailwind CSS, ECharts, Motion, and related libraries.
- Backend: PostgreSQL database through `pg` and `kysely`, plus a local WebSocket server through `ws`.
- i18n: LinguiJS and Crowdin.
- Linting: oxlint with custom rules in `linter/`.
- Testing: Vitest through `vite-plus/test`.
- Build: Vite+, esbuild, and electron-builder.
- Counter-Strike specific: `@akiver/cs-demo-analyzer`, `@akiver/csgo-voice-extractor`, `csgo-protobuf`, and
  `csgo-sharecode`.

## Common Commands

Development:

- `vp run dev` - start the Electron app in dev mode with hot reload.
- `vp run dev:cli` - start the CLI in dev mode with hot reload.

Build:

- `vp run build` - production build for main/server/preload and renderer.
- `vp run package` - package the app with electron-builder. This runs `build` first.
- `vp run i18n:extract` - extract localizable strings into Lingui catalogs.

Code quality:

- `vp run compile` - TypeScript type-check only.
- `vp run lint` - lint the project.
- `vp run lint:fix` - lint and auto-fix.
- `vp run format` - format with oxfmt.
- `vp run test` - run all tests.
- `vp test src/path/to/file.test.ts` - run tests in one file.
- `vp run test:watch` - run tests in watch mode.
- `vp run deadcode` - find unused code.

## Validation Workflow

Before submitting changes, all of the following should pass when practical:

1. `vp check` - lint, format, and type-check.
2. `vp run test` - all unit tests.
3. `vp run deadcode` - no unused code introduced.
4. `vp run i18n:extract` - required if user-visible English source strings were added or changed.

## Architecture

The app has three main OS processes:

- `src/electron-main/`: Electron main process, app window, shell integrations, updater, native OS coordination.
- `src/server/`: local WebSocket server and message handlers. The renderer asks this process for database and filesystem
  work.
- `src/ui/`: React renderer process.

Shared or non-renderer code lives in:

- `src/common/`: shared types, constants, math helpers, and pure utilities.
- `src/node/`: Node-only code that can be used by Electron main, server, or CLI code.
- `src/preload/`: Electron preload APIs exposed safely to the renderer.

The renderer and main process communicate with the local server over WebSocket messages. New data reads usually need:

1. A common type in `src/common/types/` if the payload crosses process boundaries.
2. A database query in `src/node/database/`.
3. A server handler in `src/server/handlers/renderer-process/`.
4. A renderer message/action/hook in `src/ui/`.

## Project Structure

```text
cs2-server-plugin/   # C++ CS2 server plugin to control the game
csgo-server-plugin/  # C++ CS:GO server plugin to control the game
docs/                # Local design notes and customization plans
src/
  cli/               # CLI related code
  common/            # Shared types, constants, and pure utilities
  electron-main/     # Electron main process only
  node/              # Pure Node.js code for non-renderer processes
    database/        # Kysely queries organized by entity
    settings/        # App settings and schema migrations
    counter-strike/  # CS process detection and game interaction
    video/           # FFmpeg, HLAE, VirtualDub, and video helpers
    filesystem/      # Filesystem utilities
  preload/           # Electron preload script
  server/            # WebSocket server and handlers
  ui/                # React renderer
    store/           # Redux typed hooks and reducers
    components/      # Reusable UI components
    shared/          # UI utilities, colors, element IDs
    match/           # Match detail pages: overview, rounds, grenades, players, etc.
    player/          # Player profile pages
```

## Coding Conventions

- Follow existing patterns and conventions in the codebase.
- Follow lint rules. Never alter lint config to bypass rules.
- `csdm/*` resolves to `src/*`. Use this alias for cross-directory imports.
- Keep customizations narrowly scoped so upstream merges stay manageable.
- Prefer adding small helper modules next to the feature instead of modifying shared core code unless necessary.

### Styling

- Style components with Tailwind utility classes.
- Use inline styles only for dynamic values.
- Tokens are defined in `src/ui/styles/variables.css`; prefer existing tokens.
- Most Tailwind defaults are wiped in `variables.css`; avoid arbitrary values like `p-[7px]`.

### State Management

- Use Redux Toolkit for global state when the existing feature already does.
- For simple view-local state, prefer `useState`, `useReducer`, and `useMemo`.
- Import Redux hooks from `csdm/ui/store/use-dispatch` and `csdm/ui/store/use-selector`, never directly from
  `react-redux`.

## Logging

Use the global `logger` instead of `console`. The `no-console` rule is enforced outside `src/cli/`.

## Testing

Only unit tests exist today. Tests are colocated next to source files as `*.test.ts`. Import `describe` and `it` from
`vite-plus/test`, not directly from `vitest`.

## i18n

The app uses LinguiJS. Source strings are written in English and extracted into:

- `src/ui/translations/en/messages.po` for renderer strings.
- `src/electron-main/translations/en/*.json` for Electron main strings.

Only English source catalogs are committed. Other locales are managed on Crowdin and downloaded at build time. Do not
manually translate non-English catalogs.

When adding or changing user-visible UI strings:

1. Use Lingui patterns already present in nearby files.
2. Run `vp run i18n:extract`.
3. Commit the updated English catalog only.

## Current Customization Notes

- The current source settings schema is `13`, inherited from upstream commit `c88227fd feat: unzip demos from archives`.
  Do not lower it unless intentionally reverting that upstream feature. Installed app version `12` is older and may reset
  shared `.csdm/settings.json` if it sees schema `13`.
- Local design plans live in `docs/`. The match overview cumulative round-stat design is in
  `docs/match-overview-round-progress-plan.md`.
- Player grenade profile customizations are documented in `docs/player-grenades-statistics-plan.md`.
- Custom build and zh-CN preview notes are documented in `docs/custom-build-and-localization-notes.md`.

## Git Commits

- Use conventional commits, for example `feat(demos): add tickrate column in table`.
- Never add yourself or an AI tool as a co-author.
- Commit completed local changes unless the user explicitly asks not to.
