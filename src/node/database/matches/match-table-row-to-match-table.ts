import type { MatchTable, MatchTablePlayer } from 'csdm/common/types/match-table';
import type { MatchTableRow } from 'csdm/node/database/matches/match-table-row';
import type { CollateralKillPerMatch } from './fetch-collateral-kill-count-per-match';

export function matchTableRowToMatchTable(
  row: MatchTableRow,
  tagIds: string[],
  collateralKillCountPerMatch: CollateralKillPerMatch,
  playersPerMatch: Record<string, MatchTablePlayer[]>,
): MatchTable {
  return {
    checksum: row.checksum,
    type: row.type,
    game: row.game,
    analyzeDate: row.analyze_date.toISOString(),
    assistCount: row.assist_count,
    clientName: row.client_name,
    comment: row.comment ?? '',
    date: row.date.toISOString(),
    players: playersPerMatch[row.checksum] ?? [],
    deathCount: row.death_count,
    killCount: row.kill_count,
    collateralKillCount: collateralKillCountPerMatch[row.checksum] ?? 0,
    duration: row.duration,
    demoFilePath: row.demo_path,
    mapName: row.map_name,
    name: row.name,
    serverName: row.server_name,
    source: row.source,
    tickrate: row.tickrate,
    frameRate: row.framerate,
    tickCount: row.tick_count,
    gameMode: row.game_mode_str,
    isRanked: row.is_ranked,
    bannedPlayerCount: row.banned_player_count ?? 0,
    teamAName: row.teamAName,
    teamAScore: row.teamAScore,
    teamBName: row.teamBName,
    teamBScore: row.teamBScore,
    shareCode: row.share_code,
    fiveKillCount: row.fiveKillCount,
    fourKillCount: row.fourKillCount,
    threeKillCount: row.threeKillCount,
    hltvRating2: row.hltvRating2,
    tagIds,
  };
}
