import type { Settings } from '../settings';
import type { Migration } from '../migration';

const v9: Migration = {
  schemaVersion: 9,
  run: (settings: Settings) => {
    settings.video.showAssists = true;
    settings.playback.followSymbolicLinks = false;
    settings.playback.customCs2SteamRuntimeScriptLocationEnabled = false;
    settings.playback.cs2SteamRuntimeScriptPath = '';
    settings.ui.enableHardwareAcceleration = true;

    return Promise.resolve(settings);
  },
};

// eslint-disable-next-line no-restricted-syntax
export default v9;
