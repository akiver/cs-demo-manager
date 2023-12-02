import { useSelector } from 'csdm/ui/store/use-selector';

export function useVideoState() {
  const videoState = useSelector((state) => state.match.video);

  return videoState;
}
