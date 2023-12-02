import fs from 'fs-extra';
import { ErrorCode } from 'csdm/common/error-code';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { getHlaeVersionFromExecutable } from 'csdm/node/video/hlae/get-hlae-version-from-executable';
import { updateSettingsAndNotifyRendererProcess } from 'csdm/server/update-settings-and-notify-renderer-process';
import type { HlaeSettings } from 'csdm/node/settings/settings';
import { getDefaultHlaeExecutablePath } from 'csdm/node/video/hlae/hlae-location';
import { checkForHlaeUpdate } from 'csdm/node/video/hlae/check-for-hlae-update';
import type { HlaeVersionChangedPayload } from './hlae-version-changed-payload';

export async function disableHlaeCustomLocationHandler(clearCustomLocation?: boolean) {
  const result: HlaeVersionChangedPayload = {
    errorCode: undefined,
    version: undefined,
    isUpdateAvailable: false,
  };

  try {
    const newHlaeSettings: Partial<HlaeSettings> = {
      customLocationEnabled: false,
    };

    if (clearCustomLocation) {
      newHlaeSettings.customExecutableLocation = '';
    }

    await updateSettingsAndNotifyRendererProcess({
      video: {
        hlae: newHlaeSettings,
      },
    });

    const defaultHlaeExecutablePath = getDefaultHlaeExecutablePath();
    const executableExists = await fs.pathExists(defaultHlaeExecutablePath);
    if (!executableExists) {
      return result;
    }

    const version = await getHlaeVersionFromExecutable(defaultHlaeExecutablePath);

    let isUpdateAvailable = false;
    if (version !== undefined) {
      isUpdateAvailable = await checkForHlaeUpdate(version);
    }

    return {
      ...result,
      version,
      isUpdateAvailable,
    };
  } catch (error) {
    const errorCode = getErrorCodeFromError(error);
    if (errorCode === ErrorCode.UnknownError) {
      logger.error('Error while disabling HLAE custom location');
      logger.error(error);
    }

    return {
      ...result,
      errorCode,
    };
  }
}
