import { useSelector } from 'csdm/ui/store/use-selector';
import type { PlayersState } from './players-reducer';

export function usePlayersState(): PlayersState {
  const state = useSelector((state) => state.players);

  return state;
}
