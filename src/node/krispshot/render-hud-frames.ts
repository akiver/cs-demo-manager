import fs from 'fs-extra';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { KrispShotClipJob } from 'csdm/common/types/krispshot';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';
import { CdpBrowser } from './cdp-browser';

// Height of the strip at the bottom of the 1920x1080 frame the HUD card can use.
export const HUD_STRIP_HEIGHT = 420;
const BATCH_SIZE = 8;
const HUD_BASE_DURATION = 6;

export type HudFrames = { pattern: string; frameCount: number; stripHeight: number };

export function getHudHtmlPath() {
  return path.join(getStaticFolderPath(), 'krispshot', 'hud.html');
}

type Options = {
  browserPath: string;
  hud: KrispShotClipJob['hud'];
  framerate: number;
  clipSeconds: number;
  outputFolderPath: string;
  signal?: AbortSignal;
  onProgress?: (ratio: number) => void;
};

/**
 * Renders the HUD lower third (static/krispshot/hud.html, the "HUD" card of Clutch Title Studio) as transparent PNG
 * frames, one per frame of the clip: frame i shows the card at (i / fps - startSeconds). The card animates in at
 * startSeconds, is held, and animates out ~0.25 s before the clip ends.
 */
export async function renderHudFrames({
  browserPath,
  hud,
  framerate,
  clipSeconds,
  outputFolderPath,
  signal,
  onProgress,
}: Options): Promise<HudFrames> {
  await fs.ensureDir(outputFolderPath);
  const frameCount = Math.max(1, Math.round(clipSeconds * framerate));
  const start = Math.min(Math.max(0, hud.startSeconds), Math.max(0, clipSeconds - 1));
  const hold = Math.max(0, clipSeconds - start - HUD_BASE_DURATION - 0.25);
  const browser = await CdpBrowser.launch(browserPath);
  try {
    const evaluate = await browser.open(pathToFileURL(getHudHtmlPath()).href);
    const loadStartedAt = Date.now();
    while (!(await evaluate<boolean>('window.__ready === true && !!window.__studio'))) {
      if (Date.now() - loadStartedAt > 15_000) {
        throw new Error('The HUD page did not load');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const settings = {
      global: { color: hud.color, size: hud.size, shake: hud.shake, glow: hud.glow, hold },
      per: {
        name: hud.name,
        team: hud.team,
        badge: hud.badge,
        badgeSub: hud.badgeSub,
        kills: hud.kills,
        info: hud.info,
        pos: hud.position,
      },
    };
    await evaluate(`window.__studio.set(${JSON.stringify(settings)}), true`);
    const totalSeconds = await evaluate<number>('window.__studio.total()');
    const y = 1080 - HUD_STRIP_HEIGHT;

    const blankPath = path.join(outputFolderPath, 'blank.png');
    const blank = await evaluate<string>(`window.__studio.cropFrame(-10, ${y}, ${HUD_STRIP_HEIGHT})`);
    await fs.writeFile(blankPath, Buffer.from(blank.split(',')[1], 'base64'));

    let frame = 0;
    while (frame < frameCount) {
      if (signal?.aborted) {
        throw new Error('Cancelled');
      }
      const batch: number[] = [];
      for (let i = 0; i < BATCH_SIZE && frame + i < frameCount; i++) {
        batch.push(frame + i);
      }
      const times = batch.map((n) => n / framerate - start);
      const visible = times.map((t) => t >= 0 && t <= totalSeconds + 0.05);
      const toRender = times.filter((_, index) => visible[index]);
      const images =
        toRender.length > 0
          ? await evaluate<string[]>(
              `[${toRender.join(',')}].map((t) => window.__studio.cropFrame(t, ${y}, ${HUD_STRIP_HEIGHT}))`,
            )
          : [];
      let imageIndex = 0;
      for (const [index, frameNumber] of batch.entries()) {
        const framePath = path.join(outputFolderPath, `f_${String(frameNumber).padStart(6, '0')}.png`);
        if (visible[index]) {
          await fs.writeFile(framePath, Buffer.from(images[imageIndex++].split(',')[1], 'base64'));
        } else {
          await fs.copyFile(blankPath, framePath);
        }
      }
      frame += batch.length;
      onProgress?.(frame / frameCount);
    }

    return { pattern: path.join(outputFolderPath, 'f_%06d.png'), frameCount, stripHeight: HUD_STRIP_HEIGHT };
  } finally {
    await browser.close();
  }
}
