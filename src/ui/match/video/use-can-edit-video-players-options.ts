import { Game } from 'csdm/common/types/counter-strike';
import { useCurrentMatch } from '../use-current-match';
import { useIsHlaeEnabled } from './hlae/use-is-hlae-enabled';

export function useCanEditVideoPlayersOptions() {
  const match = useCurrentMatch();
  const isHlaeEnabled = useIsHlaeEnabled();

  if (!isHlaeEnabled) {
    return false;
  }

  return match.game !== Game.CSGO || window.csdm.isWindows;
}
