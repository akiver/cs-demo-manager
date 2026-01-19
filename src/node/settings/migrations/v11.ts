import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { DisplayMode } from 'csdm/common/types/display-mode';

const v11: Migration = {
  schemaVersion: 11,
  run: (settings: Settings) => {
    // @ts-expect-error Remove deprecated fullscreen setting
    delete settings.playback.fullscreen;
    settings.playback.displayMode = DisplayMode.Windowed;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v11;
