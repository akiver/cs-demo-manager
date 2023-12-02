import { useVideoState } from 'csdm/ui/match/video/use-video-state';
import type { SequencesByDemoFilePath } from './sequences-reducer';

export function useSequencesByDemoFilePath(): SequencesByDemoFilePath {
  const video = useVideoState();

  return video.sequencesByDemoFilePath;
}
