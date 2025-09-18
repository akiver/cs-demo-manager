import { useFfmpegState } from './use-ffmpeg-state';

export function useInstalledFfmpegVersion() {
  const ffmpegState = useFfmpegState();

  return ffmpegState.version;
}
