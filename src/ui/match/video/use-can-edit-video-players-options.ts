import { Game } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from '../use-current-match';

export function useCanEditVideoPlayersOptions() {
  const match = useCurrentMatch();

  return match.game !== Game.CSGO || window.csdm.isWindows;
}
