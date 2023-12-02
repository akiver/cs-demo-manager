import path from 'node:path';
import fs from 'fs-extra';
import { i18n } from '@lingui/core';
import { getLocaleFolderName } from 'csdm/common/get-locale-folder-name';

async function loadLocale(locale: string) {
  const folderName = getLocaleFolderName(locale);
  const jsonPath = path.join(__dirname, 'translations', folderName, 'messages.json');
  const content = await fs.readFile(jsonPath, 'utf8');
  const messages = JSON.parse(content);
  i18n.loadAndActivate({ locale, messages });
}

export async function loadI18n(locale: string) {
  try {
    await loadLocale(locale);
  } catch (error) {
    await loadLocale('en');
  }
}
