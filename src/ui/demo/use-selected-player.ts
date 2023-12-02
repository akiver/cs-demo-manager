import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { useDemoState } from './use-demo-state';

export function useSelectedPlayer(): ValvePlayer {
  const demoState = useDemoState();

  if (demoState.selectedPlayer === undefined) {
    throw new Error('No player selected');
  }

  return demoState.selectedPlayer;
}
