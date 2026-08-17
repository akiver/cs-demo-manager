import fs from 'fs-extra';
import crypto from 'node:crypto';
import path from 'node:path';
import { getSettingsFilePath } from './get-settings-file-path';
import type { Settings } from './settings';

const STALE_SETTINGS_TEMPORARY_FILE_AGE_MS = 24 * 60 * 60 * 1000;

async function cleanupStaleTemporaryFiles(settingsFilePath: string) {
  const folderPath = path.dirname(settingsFilePath);
  const fileNamePrefix = `${path.basename(settingsFilePath)}.`;
  const staleBefore = Date.now() - STALE_SETTINGS_TEMPORARY_FILE_AGE_MS;

  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.startsWith(fileNamePrefix) && entry.name.endsWith('.tmp'))
        .map(async (entry) => {
          const temporaryFilePath = path.join(folderPath, entry.name);
          try {
            const stats = await fs.stat(temporaryFilePath);
            if (stats.mtimeMs < staleBefore) {
              await fs.remove(temporaryFilePath);
            }
          } catch (error) {
            logger.warn(`Failed to clean up the stale settings file ${temporaryFilePath}`);
            logger.warn(error);
          }
        }),
    );
  } catch (error) {
    logger.warn('Failed to inspect stale settings temporary files');
    logger.warn(error);
  }
}

export async function writeSettings(settings: Settings) {
  try {
    const settingsFilePath = getSettingsFilePath();
    const json = JSON.stringify(settings, null, 2);
    const temporaryFilePath = path.join(
      path.dirname(settingsFilePath),
      `${path.basename(settingsFilePath)}.${process.pid}.${crypto.randomUUID()}.tmp`,
    );

    await fs.ensureDir(path.dirname(settingsFilePath));
    await cleanupStaleTemporaryFiles(settingsFilePath);
    try {
      await fs.writeFile(temporaryFilePath, json);
      await fs.rename(temporaryFilePath, settingsFilePath);
    } catch (error) {
      try {
        await fs.remove(temporaryFilePath);
      } catch (cleanupError) {
        logger.warn(`Failed to clean up the settings temporary file ${temporaryFilePath}`);
        logger.warn(cleanupError);
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error while writing settings');
    logger.error(error);
    throw error;
  }
}
