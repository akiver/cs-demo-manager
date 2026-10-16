import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';

export type PlayerPosition = PlayerMovement & Omit<PlayerState, 'tick'>;
