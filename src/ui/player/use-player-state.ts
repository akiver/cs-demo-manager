import { useSelector } from 'csdm/ui/store/use-selector';

export function usePlayerState() {
  const playerState = useSelector((state) => state.player);

  return playerState;
}
