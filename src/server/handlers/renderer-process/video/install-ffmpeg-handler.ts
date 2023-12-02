import { installFfmpeg } from 'csdm/node/video/ffmpeg/install-ffmpeg';
import { handleError } from '../../handle-error';

export async function installFfmpegHandler() {
  try {
    const version = await installFfmpeg();

    return version;
  } catch (error) {
    handleError(error, 'Error while installing FFmpeg');
  }
}
