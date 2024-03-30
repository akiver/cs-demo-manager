import type { Settings } from '../../settings';
import type { Migration } from '../../migration';
import { defaultSettings } from '../../default-settings';

const addVideoContainerOption: Migration = {
  schemaVersion: 2,
  run: (settings: Settings) => {
    settings.video.ffmpegSettings.videoContainer = defaultSettings.video.ffmpegSettings.videoContainer;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default addVideoContainerOption;
