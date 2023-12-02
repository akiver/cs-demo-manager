import { isHlaeUpdateAvailable } from 'csdm/node/video/hlae/is-hlae-update-available';
import { getInstalledFfmpegVersion } from 'csdm/node/video/ffmpeg/get-installed-ffmpeg-version';
import { getInstalledVirtualDubVersion } from 'csdm/node/video/virtual-dub/get-installed-virtual-dub-version';
import { getInstalledHlaeVersion } from 'csdm/node/video/hlae/get-installed-hlae-version';
import { isWindows } from 'csdm/node/os/is-windows';
import { isFfmpegUpdateAvailable } from 'csdm/node/video/ffmpeg/is-ffmpeg-update-available';
import { getSettings } from 'csdm/node/settings/get-settings';
import { getRawFilesFolderPath } from 'csdm/node/video/get-raw-files-folder-path';
import { getOutputFolderPath } from 'csdm/node/video/get-output-folder-path';
import { handleError } from '../../handle-error';

export type InitializeVideoPayload = {
  demoFilePath: string;
};

export type InitializeVideoSuccessPayload = {
  hlaeVersion: string | undefined;
  hlaeUpdateAvailable: boolean;
  virtualDubVersion: string | undefined;
  ffmpegVersion: string | undefined;
  ffmpegUpdateAvailable: boolean;
  rawFilesFolderPath: string;
  outputFolderPath: string;
};

export async function initializeVideoHandler({ demoFilePath }: InitializeVideoPayload) {
  try {
    const settings = await getSettings();
    const promises = [
      getInstalledFfmpegVersion(),
      isFfmpegUpdateAvailable(),
      getRawFilesFolderPath(settings.video, demoFilePath),
      getOutputFolderPath(settings.video, demoFilePath),
    ];
    if (isWindows) {
      promises.push(getInstalledHlaeVersion(), isHlaeUpdateAvailable(), getInstalledVirtualDubVersion());
    }

    const [
      installedFfmpegVersion,
      ffmpegUpdateAvailable,
      rawFilesFolderPath,
      outputFolderPath,
      installedHlaeVersion,
      hlaeUpdateAvailable,
      installedVirtualDubVersion,
    ] = (await Promise.all(promises)) as [
      string | undefined,
      boolean,
      string,
      string,
      string | undefined,
      boolean,
      string | undefined,
    ];

    const payload: InitializeVideoSuccessPayload = {
      hlaeVersion: installedHlaeVersion,
      virtualDubVersion: installedVirtualDubVersion,
      hlaeUpdateAvailable,
      ffmpegVersion: installedFfmpegVersion,
      ffmpegUpdateAvailable,
      rawFilesFolderPath,
      outputFolderPath,
    };

    return payload;
  } catch (error) {
    handleError(error, 'Error while initializing video');
  }
}
