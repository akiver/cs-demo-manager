import { useFfmpegState } from './use-ffmpeg-state';

export function useInstalledFfmpegVersion(): string | undefined {
  const ffmpegState = useFfmpegState();

  return ffmpegState.version;
}
