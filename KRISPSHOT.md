# KrispShot Demo Manager

KrispShot Demo Manager is a fork of [CS Demo Manager](https://github.com/akiver/cs-demo-manager) (MIT) with a
**clip worker for krispshot.in** built in. Premium players queue clips on the website (`/clips/new`). This app
records them on the Windows PC with its own analysis and video queues, adds the KrispShot HUD lower third (player
name, kills, gun, map), and uploads the MP4 to the website. Each clip then shows on the player's generation page and
in the gallery (`/clips`).

Everything else is stock CS Demo Manager. It uses the same data folder (`%USERPROFILE%\.csdm`), the same bundled
database, and the same settings.

## How a clip is made

```
krispshot.in queue ──claim──► worker (inside the app's background server)
  1. download the match demo from the CDN (cached per match)
  2. analyze it with the app's analysis queue, as a MatchZy demo        → shows on the Analyses page
  3. record it with the app's video queue: HLAE, CS2, game audio, FFmpeg → shows on the Videos page
     one sequence per part, camera on the player, only their kills in the kill feed (highlighted)
  4. HUD frames (static/krispshot/hud.html in headless Edge) + FFmpeg: join the parts, overlay, H.264/AAC MP4
  5. upload the MP4 + thumbnail, mark the job done
```

- **One at a time.** The website gives out one job at a time. The app's video queue also runs one video at a time,
  together with any video you queue by hand.
- **Audio sync.** HLAE records the game sound together with the frames. When parts are joined, each part's sound is
  cut or padded to that part's exact video length, so the sync can't drift.
- **Cancel.** When a player or admin cancels a clip on the website, the worker removes the video from the queue
  (CS Demo Manager stops CS2) within about 10 seconds.
- **Failures** go back to the website with CS Demo Manager's error message. The website retries once, and admins
  can click Retry on Admin → Clips.
- **Window closed.** While the worker is on, the app's background server keeps running after the window is closed.
  Set Settings → UI → "System startup behavior" to Minimized so it starts after a reboot.

## Setup on the recorder PC

1. Uninstall the separate `clip-recorder` (Node script) if you used it, and **stock CS Demo Manager**. This build
   uses the same app id, so installing it replaces stock CS Demo Manager in place and keeps all your data.
2. Install **KrispShot Demo Manager** (see Building below) and finish CS Demo Manager's first-run setup.
3. Open **Settings → KrispShot**:
   - Website address: `https://krispshot.in`
   - Recorder key: from the website's **Admin → Clips → Recorder config**
   - Demo source: `matchzy`, the default
   - Click **Test connection**, then **Save**, then turn on **Clip worker**.
4. Admin → Clips on the website now shows **Recorder online**. The status, progress and log are on the same
   Settings page.

HLAE and FFmpeg are installed automatically the first time a clip is recorded. They are the same ones as in
Settings → Video, and a custom FFmpeg location set there is used too. Steam must be running, and CS2 must not
already be open.

## Building

**Option A: GitHub (no build tools on your PC).** Push this repository to your GitHub and open **Actions → Build
KrispShot Demo Manager → Run workflow**. When it finishes, download the installer from the run's **Artifacts**
(`KrispShot-Demo-Manager-windows`).

**Option B: on Windows.** You need Git and [Vite+](https://viteplus.dev/guide/) (`vp`). It installs the Node.js
version the project needs.

```
git clone <your fork> krispshot-demo-manager
cd krispshot-demo-manager
git checkout krispshot
vp install
vp run build
vp run package --win --publish=never
```

The installer is written to `dist\`. Optional build-time keys: `STEAM_API_KEYS`, `FACEIT_API_KEY`,
`CROWDIN_PERSONAL_TOKEN` (translations; without it the build is English only).

**Updates.** The auto-updater is switched off in this build, because CS Demo Manager's own updates would replace it.
To update: `git pull` the upstream changes into this branch (the KrispShot changes are small, listed below), rebuild,
and reinstall.

## What the fork changes

New files:

```
src/common/types/krispshot.ts                       shared types
src/node/krispshot/krispshot-settings.ts           %USERPROFILE%\.csdm\krispshot.json
src/node/krispshot/site-api.ts                     krispshot.in /api/clips/worker/* client
src/node/krispshot/download-demo.ts                demo download + unzip + cache
src/node/krispshot/build-clip-video.ts             website job → video queue payload (sequences)
src/node/krispshot/cdp-browser.ts                  headless Edge / Chrome (DevTools protocol)
src/node/krispshot/render-hud-frames.ts            HUD frames
src/node/krispshot/compose-clip.ts                 FFmpeg: join parts, HUD overlay, MP4, thumbnail
src/node/krispshot/run-process.ts
src/server/krispshot/krispshot-worker.ts           the worker
src/server/handlers/renderer-process/krispshot/*   UI ↔ server messages
src/ui/settings/krispshot/krispshot-settings.tsx   Settings → KrispShot
static/krispshot/hud.html                          the HUD lower third (Clutch Title Studio "HUD" card)
.github/workflows/krispshot-build.yml              Windows installer build
```

Small edits: `video-queue.ts` (listeners), `idle-monitor.ts` (keeps the server running while the worker is on),
`start-server.ts` (starts the worker), the message name enums and handler mapping, the settings category and tab,
`auto-updater.ts` (off), `create-tray.ts` and `electron-builder.config.mjs` (product name).

## HUD fonts (optional)

For the exact Clutch Title Studio look, put the CTD fonts in `static/krispshot/fonts/` as `ctd-900.woff`,
`ctd-700.woff` and `ctd-600.woff` before building. Without them the card uses Windows' Bahnschrift.
