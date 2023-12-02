import { installFfmpeg } from 'csdm/node/video/ffmpeg/install-ffmpeg';
import { handleError } from '../../handle-error';

export async function updateFfmpegHandler() {
  try {
    const version = await installFfmpeg();

    return version;
  } catch (error) {
    handleError(error, 'Error while updating FFmpeg');
  }
}
