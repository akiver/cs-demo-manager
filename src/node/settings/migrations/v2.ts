import type { Settings } from '../settings';
import type { Migration } from '../migration';
import { defaultSettings } from '../default-settings';

const v2: Migration = {
  schemaVersion: 2,
  run: (settings: Settings) => {
    settings.video.ffmpegSettings.videoContainer = defaultSettings.video.ffmpegSettings.videoContainer;
    settings.playback.round = defaultSettings.playback.round;

    return Promise.resolve(settings);
  },
};

export default v2;
