import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v7: Migration = {
  schemaVersion: 7,
  run: (settings: Settings) => {
    // Rename sources to demoSources
    // @ts-expect-error Old settings schema
    settings.matches.demoSources = settings.matches.sources;
    // @ts-expect-error Old settings schema
    delete settings.matches.sources;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v7;
