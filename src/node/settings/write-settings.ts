import fs from 'fs-extra';
import crypto from 'node:crypto';
import path from 'node:path';
import { getSettingsFilePath } from './get-settings-file-path';
import type { Settings } from './settings';

export async function writeSettings(settings: Settings) {
  try {
    const settingsFilePath = getSettingsFilePath();
    const json = JSON.stringify(settings, null, 2);
    const temporaryFilePath = path.join(
      path.dirname(settingsFilePath),
      `${path.basename(settingsFilePath)}.${process.pid}.${crypto.randomUUID()}.tmp`,
    );

    await fs.ensureDir(path.dirname(settingsFilePath));
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
