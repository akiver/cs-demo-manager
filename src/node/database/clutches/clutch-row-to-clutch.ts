import type { ClutchRow } from './clutch-table';
import type { Clutch } from 'csdm/common/types/clutch';

export function clutchRowToClutch(row: ClutchRow): Clutch {
  return {
    id: row.id,
    frame: row.frame,
    matchChecksum: row.match_checksum,
    roundNumber: row.round_number,
    tick: row.tick,
    clutcherName: row.clutcher_name,
    clutcherSteamId: row.clutcher_steam_id,
    won: row.won,
    opponentCount: row.opponent_count,
    side: row.side,
    hasClutcherSurvived: row.has_clutcher_survived,
    clutcherKillCount: row.clutcher_kill_count,
  };
}
