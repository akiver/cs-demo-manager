import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';

// Movements and states of a player during a round, both sorted by tick.
export type PlayerTimeline = {
  movements: PlayerMovement[];
  states: PlayerState[];
};
