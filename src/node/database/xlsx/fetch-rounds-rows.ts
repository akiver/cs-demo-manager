import { db } from 'csdm/node/database/database';

export type RoundRow = {
  matchChecksum: string;
  number: number;
  startTick: number;
  startFrame: number;
  freezeTimeEndTick: number;
  freezeTimeEndFrame: number;
  endTick: number;
  endFrame: number;
  scoreTeamA: number;
  scoreTeamB: number;
  sideTeamA: number;
  sideTeamB: number;
  startMoneyTeamA: number;
  startMoneyTeamB: number;
  duration: number;
  endReason: number;
  winnerName: string;
  winnerSide: number;
};

export async function fetchRoundsRows(checksums: string[]) {
  const rows: RoundRow[] = await db
    .selectFrom('rounds')
    .select('match_checksum as matchChecksum')
    .select('number')
    .select('start_tick as startTick')
    .select('start_frame as startFrame')
    .select('freeze_time_end_tick as freezeTimeEndTick')
    .select('freeze_time_end_frame as freezeTimeEndFrame')
    .select('end_tick as endTick')
    .select('end_frame as endFrame')
    .select('duration')
    .select('team_a_score as scoreTeamA')
    .select('team_b_score as scoreTeamB')
    .select('team_a_side as sideTeamA')
    .select('team_b_side as sideTeamB')
    .select('winner_side as winnerSide')
    .select('winner_name as winnerName')
    .select('end_reason as endReason')
    .select('team_a_start_money as startMoneyTeamA')
    .select('team_b_start_money as startMoneyTeamB')
    .where('match_checksum', 'in', checksums)
    .execute();

  return rows;
}
