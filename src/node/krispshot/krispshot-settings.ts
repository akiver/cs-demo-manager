import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';
import type { KrispShotSettings } from 'csdm/common/types/krispshot';

// Kept in its own file (not settings.json) so the KrispShot changes never collide with CS Demo Manager's settings
// schema / migrations when the fork is updated from upstream.
function getSettingsFilePath() {
  return path.join(getAppFolderPath(), 'krispshot.json');
}

export function getKrispShotFolderPath() {
  return path.join(getAppFolderPath(), 'krispshot');
}

export const defaultKrispShotSettings: KrispShotSettings = {
  enabled: false,
  siteUrl: 'https://krispshot.in',
  workerKey: '',
  workerName: os.hostname().slice(0, 64),
  demoSource: 'matchzy',
  keepFiles: false,
  demoCacheSize: 5,
  browserPath: '',
};

function normalize(input: Partial<KrispShotSettings>): KrispShotSettings {
  const s = { ...defaultKrispShotSettings, ...input };
  return {
    enabled: s.enabled === true,
    siteUrl: String(s.siteUrl ?? '')
      .trim()
      .replace(/\/+$/, ''),
    workerKey: String(s.workerKey ?? '').trim(),
    workerName: (String(s.workerName ?? '').trim() || os.hostname()).slice(0, 64),
    demoSource:
      String(s.demoSource ?? 'matchzy')
        .trim()
        .toLowerCase() || 'matchzy',
    keepFiles: s.keepFiles === true,
    demoCacheSize: Math.max(1, Math.min(50, Math.round(Number(s.demoCacheSize) || 5))),
    browserPath: String(s.browserPath ?? '')
      .trim()
      .replace(/^["']|["']$/g, ''),
  };
}

export async function getKrispShotSettings(): Promise<KrispShotSettings> {
  try {
    const filePath = getSettingsFilePath();
    if (!(await fs.pathExists(filePath))) {
      return { ...defaultKrispShotSettings };
    }
    return normalize(await fs.readJson(filePath));
  } catch (error) {
    logger.error('[krispshot] Failed to read krispshot.json');
    logger.error(error);
    return { ...defaultKrispShotSettings };
  }
}

export async function writeKrispShotSettings(settings: Partial<KrispShotSettings>): Promise<KrispShotSettings> {
  const current = await getKrispShotSettings();
  const next = normalize({ ...current, ...settings });
  await fs.ensureDir(getAppFolderPath());
  await fs.writeJson(getSettingsFilePath(), next, { spaces: 2 });
  return next;
}

export function isKrispShotConfigured(settings: KrispShotSettings) {
  return /^https?:\/\//.test(settings.siteUrl) && settings.workerKey !== '';
}
