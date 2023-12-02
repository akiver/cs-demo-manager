import { killProcessesByNames } from 'csdm/node/os/kill-processes-by-names';
import { isWindows } from 'csdm/node/os/is-windows';

export async function killFfmpegProcess() {
  await killProcessesByNames([isWindows ? 'ffmpeg.exe' : 'ffmpeg']);
}
