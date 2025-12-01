import { exec } from 'node:child_process';
import { abortError } from 'csdm/node/errors/abort-error';
import { FFmpegError } from 'csdm/node/video/errors/ffmpeg-error';

export async function executeFfmpeg(ffmpegExecutablePath: string, args: string[], signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      return reject(abortError);
    }

    const command = `"${ffmpegExecutablePath}" ${args.join(' ')}`;
    logger.debug('Starting FFmpeg', command);
    const process = exec(command, { windowsHide: true });

    const chunks: string[] = [];
    process.stdout?.on('data', (data: string) => {
      chunks.push(data);
    });

    process.stderr?.on('data', (data: string) => {
      chunks.push(data);
    });

    process.on('exit', (code) => {
      logger.debug('FFmpeg exit', code);
      if (signal.aborted) {
        return reject(abortError);
      }

      const output = chunks.join('\n');
      logger.debug('FFmpeg output: \n', output);

      if (code === 0) {
        resolve();
      } else {
        reject(new FFmpegError(output));
      }
    });
  });
}
