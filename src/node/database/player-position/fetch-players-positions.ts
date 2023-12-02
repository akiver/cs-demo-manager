import { db } from 'csdm/node/database/database';
import type { PlayerPosition } from '../../../common/types/player-position';
import { playerPositionRowToPlayerPosition } from './player-position-row-to-player-position';

export async function fetchPlayersPositions(checksum: string, roundNumber: number) {
  const rows = await db
    .selectFrom('player_positions')
    .selectAll()
    .where('match_checksum', '=', checksum)
    .where('round_number', '=', roundNumber)
    .orderBy('frame')
    .orderBy('player_name')
    .execute();

  const playerPositions: PlayerPosition[] = rows.map(playerPositionRowToPlayerPosition);

  return playerPositions;
}
