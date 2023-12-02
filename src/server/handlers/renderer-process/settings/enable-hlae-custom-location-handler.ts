import fs from 'fs-extra';
import { getHlaeVersionFromExecutable } from 'csdm/node/video/hlae/get-hlae-version-from-executable';
import { updateSettingsAndNotifyRendererProcess } from 'csdm/server/update-settings-and-notify-renderer-process';
import { FileNotFound } from 'csdm/node/filesystem/errors/file-not-found';
import type { HlaeSettings } from 'csdm/node/settings/settings';
import { checkForHlaeUpdate } from 'csdm/node/video/hlae/check-for-hlae-update';
import type { HlaeVersionChangedPayload } from './hlae-version-changed-payload';
import { handleError } from '../../handle-error';

export async function enableHlaeCustomLocationHandler(customExecutablePath: string) {
  try {
    const executableExists = await fs.pathExists(customExecutablePath);
    if (!executableExists) {
      throw new FileNotFound(customExecutablePath);
    }

    const version = await getHlaeVersionFromExecutable(customExecutablePath);

    const hlaeSettings: Partial<HlaeSettings> = {
      customLocationEnabled: true,
      customExecutableLocation: customExecutablePath,
    };
    await updateSettingsAndNotifyRendererProcess({
      video: {
        hlae: hlaeSettings,
      },
    });

    let isUpdateAvailable = false;
    if (version !== undefined) {
      isUpdateAvailable = await checkForHlaeUpdate(version);
    }

    const payload: HlaeVersionChangedPayload = {
      version,
      isUpdateAvailable,
      errorCode: undefined,
    };

    return payload;
  } catch (error) {
    handleError(error, 'Error while enabling HLAE custom location');
  }
}
