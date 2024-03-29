import { db } from 'csdm/node/database/database';
import type { TeamNumber } from 'csdm/common/types/counter-strike';

export type ClutchRow = {
  matchChecksum: string;
  roundNumber: number;
  tick: number;
  playerName: string;
  playerSteamId: string;
  playerSide: TeamNumber;
  hasWon: boolean;
  opponentCount: number;
  killCount: number;
};

export async function fetchClutchesRows(checksums: string[]): Promise<ClutchRow[]> {
  const rows = await db
    .selectFrom('clutches')
    .where('match_checksum', 'in', checksums)
    .select([
      'match_checksum as matchChecksum',
      'round_number as roundNumber',
      'tick',
      'clutcher_name as playerName',
      'clutcher_steam_id as playerSteamId',
      'side as playerSide',
      'won as hasWon',
      'opponent_count as opponentCount',
      'clutcher_kill_count as killCount',
    ])
    .execute();

  return rows;
}
