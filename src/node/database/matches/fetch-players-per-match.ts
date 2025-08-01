import type { MatchTablePlayer } from 'csdm/common/types/match-table';
import { db } from '../database';

export async function fetchPlayersPerMatch(checksums: string[]): Promise<Record<string, MatchTablePlayer[]>> {
  const rows = await db
    .selectFrom('players')
    .select(['steam_id as steamId', 'name', 'match_checksum as checksum'])
    .where((eb) => eb('players.match_checksum', '=', eb.fn.any(eb.val(checksums))))
    .execute();

  const playersPerMatch: Record<string, MatchTablePlayer[]> = {};
  for (const row of rows) {
    const { checksum, steamId, name } = row;
    if (!playersPerMatch[checksum]) {
      playersPerMatch[checksum] = [];
    }
    playersPerMatch[checksum].push({
      steamId,
      name,
    });
  }
  return playersPerMatch;
}
