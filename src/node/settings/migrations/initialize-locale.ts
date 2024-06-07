import type { Settings } from '../settings';
import type { Migration } from '../migration';

const initializeLocale: Migration = {
  schemaVersion: 1,
  run: (settings: Settings) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const electron = require('electron');
      if (electron) {
        const locale = electron.app.getLocale();
        settings.ui.locale = locale;
      }
    } catch (error) {
      // Allow to run this migration from the CLI where Electron is not available (Node.js environment).
      // If the settings are initialized for the first time by the CLI the language will be English.
    }

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default initializeLocale;
