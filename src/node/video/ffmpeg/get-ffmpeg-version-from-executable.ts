import { exec } from 'node:child_process';
import { InvalidFfmpegExecutable } from 'csdm/node/video/errors/invalid-ffmpeg-executable';

export async function getFfmpegVersionFromExecutable(executablePath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    exec(`"${executablePath}" -version`, { windowsHide: true }, (error, stdout) => {
      if (error !== null) {
        logger.error('Error while getting FFmpeg version');
        logger.error(error);
        return reject(new InvalidFfmpegExecutable());
      }

      // Extract the "SemVer" version, see details https://ffmpeg.org/doxygen/3.3/group__version__utils.html
      // Possible output examples:
      // "ffmpeg version n4.3.1-11-g2c887141b8-20211231 Copyright" => 4.3.1
      // "ffmpeg version 4.3.1 Copyright" => 4.3.1
      const results = /ffmpeg version .*?(\d+\.\d+(\.\d+)?)(\S*)/.exec(stdout);
      if (results !== null && results.length >= 2) {
        return resolve(results[1]);
      }

      logger.warn(`Can't find FFmpeg version from stdout:`);
      logger.log(stdout);
      return reject(new InvalidFfmpegExecutable());
    });
  });
}
