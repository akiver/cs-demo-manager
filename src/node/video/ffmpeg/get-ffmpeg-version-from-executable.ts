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

      // Extract the FFmpeg version from the output, it supports the following patterns:
      // "ffmpeg version n4.3.1-11-g2c887141b8-20211231 Copyright" => 4.3.1
      // "ffmpeg version 4.3.1 Copyright" => 4.3.1
      // "ffmpeg version 2025-05-05-git-f4e72eb5a3-full_build-www.gyan.dev"
      const results =
        /ffmpeg version (?:n)?([0-9]+\.[0-9]+\.[0-9]+|[0-9]{4}-[0-9]{2}-[0-9]{2}-git-[a-z0-9]+)(?:-[^-\s]+)?/.exec(
          stdout,
        );
      if (results !== null && results.length >= 2) {
        return resolve(results[1]);
      }

      logger.warn(`Can't find FFmpeg version from stdout:`);
      logger.log(stdout);
      return reject(new InvalidFfmpegExecutable());
    });
  });
}
