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

// CS2 gets the demo path through "+playdemo" and HLAE gets the recording folder through console commands: characters
// such as ' " ; in a path (e.g. a Windows user named "Joshi'sRig") break them and the game stays on the main menu.
const SAFE_PATH = /^[A-Za-z0-9 _.\-:\\/]+$/;

export function isSafeGamePath(folderPath: string) {
  return SAFE_PATH.test(folderPath);
}

/** Where demos and recordings go: the custom folder, else <app folder>\krispshot, else C:\KrispShot. */
export function getKrispShotFolderPath(settings?: KrispShotSettings) {
  const custom = settings?.workFolder ?? '';
  if (custom !== '') {
    return path.resolve(custom);
  }
  const inAppFolder = path.join(getAppFolderPath(), 'krispshot');
  if (isSafeGamePath(inAppFolder) || process.platform !== 'win32') {
    return inAppFolder;
  }

  return 'C:\\KrispShot';
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
  workFolder: '',
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
    workFolder: String(s.workFolder ?? '')
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/[\\/]+$/, ''),
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
