# Repository guidelines

## Project

CS Demo Manager is a cross-platform Electron desktop application and CLI for analyzing Counter-Strike (CS2 / CS:GO) demo
files. It parses demos and stores data in a database. Features include match/player/team statistics, graphs,
a 2D round viewer, heatmaps, video generation, demo downloads from Valve and third-party services, XLSX/JSON export,
ban tracking, voice audio extraction and more.

## Stack

> **Important**: This project uses **Vite+** (`vp`). Always use `vp` instead of `npm` to manage dependencies and run scripts. The `vp` CLI must be installed, see the [Vite+ documentation](https://viteplus.dev/guide/).

- **Desktop framework**: Electron.
- **Languages**: TypeScript (app/CLI), C++ (CS2/CS:GO plugins and Node.js native addons).
- **UI**: React, Redux Toolkit, React Router, Tailwind CSS, ECharts, Motion, etc.
- **Backend**: PostgreSQL database (`pg` + `kysely`), WebSocket server (`ws`).
- **i18n**: LinguiJS + Crowdin.
- **Linting**: oxlint with custom rules in `linter/`.
- **Testing**: Vitest via `vite-plus/test`.
- **Build**: Vite+, esbuild, electron-builder for packaging.
- **Counter-Strike specific**: `@akiver/cs-demo-analyzer` (demo parsing), `@akiver/csgo-voice-extractor`, `csgo-protobuf`, `csgo-sharecode`.

## Common commands

Development:

- `vp run dev` — start Electron app in dev mode (hot-reload).
- `vp run dev:cli` — start CLI in dev mode (hot-reload).

Build:

- `vp run build` — production build (bundles main/server/preload with esbuild, renderer with Vite).
- `vp run package` — package as distributable with electron-builder (runs `build` first).
- `vp run i18n:extract` — extract localizable strings into .po files for Crowdin.

Code quality:

- `vp run compile` — TypeScript type-check only (no emit).
- `vp run lint` — lint entire project.
- `vp run lint:fix` — lint with auto-fix.
- `vp run format` — format code with oxfmt.
- `vp run test` — run all tests.
- `vp test src/path/to/file.test.ts` — run tests in a specific file.
- `vp run test:watch` — run tests in watch mode.
- `vp run deadcode` — find dead code.

## Validation workflow

Before submitting changes, all of the following must pass:

1. `vp check` — lint, format, and type-check
2. `vp run test` — all tests
3. `vp run deadcode` — no unused code introduced
4. `vp run i18n:extract` — if any user-visible strings were added or changed, run this and commit the updated `.po` files

## Architecture

The app runs three OS processes (main, server, renderer) plus an optional Counter-Strike client, all communicating over
a local WebSocket server. See the `/process-communication` skill for the process diagram, responsibilities, and
step-by-step wiring instructions.

## Project structure

```
cs2-server-plugin/  # C++ CS2 server "plugin" to control the game
csgo-server-plugin/  # C++ CS:GO server "plugin" to control the game
src/
  cli/           # CLI related code
  common/        # Shared across all processes (types, error codes...)
  electron-main/ # Electron main process only
  node/          # Pure Node.js code usable in any non-renderer process
    database/    # Kysely queries organized by entity (matches/, players/, demos/ …)
    settings/    # App settings related code
    counter-strike/  # CS process detection, game interaction, etc.
    video/       # Video processing and FFmpeg, HLAE, VirtualDub integration
    filesystem/  # Filesystem utilities
  preload/       # Electron preload script that exposes Node APIs to the renderer process
  server/        # WebSocket server and messages handlers
    handlers/
      renderer-process/  # Handlers for messages from the UI
      main-process/      # Handlers for messages from the Electron main process
  ui/            # React renderer
    store/       # Redux typed hooks and reducers
    components/  # Reusable UI components
    shared/      # UI utilities, colors, element IDs
    <feature>/   # One directory per feature (matches, demos, player, match, …)
```

## Coding conventions

- Follow existing patterns and conventions in the codebase.
- Follow lint rules. **Never** alter the lint config to bypass rules.
- `csdm/*` resolves to `src/*`. Always use this alias for cross-directory imports.

### Styling

- Style components with Tailwind utility classes.
- Use inline styles **only** for dynamic values.
- Tokens are defined in `src/ui/styles/variables.css` — you rarely need to add new ones, but if you do, add them there and use the token instead of hardcoded values.
- Most Tailwind's default utility values are wiped in `variables.css` — only project tokens exist (spacing, text, colors). Never use arbitrary values like `p-[7px]`.

### State management

- Use Redux Toolkit for global state.
- For simple local state, use React's `useState` or `useReducer`. **Do not** introduce a new state management library.
- Import Redux `useDispatch` and `useSelector` from the typed wrappers (`csdm/ui/store/use-dispatch` and `csdm/ui/store/use-selector`), never from `react-redux` directly.

## Logging

Use the `logger` global (a custom `ILogger` instance that writes to a log file) instead of `console`. `no-console` is enforced in all code except `src/cli/`. `logger` is injected at build time and available in all files without import.

### Testing

Only unit tests exist today — integration and E2E tests may be added later. Tests are colocated next to source files as `*.test.ts`. Import `describe` and `it` from `vite-plus/test`, not directly from `vitest`.

### i18n

Use the `/i18n` skill when adding or updating any user-visible string in the UI.
