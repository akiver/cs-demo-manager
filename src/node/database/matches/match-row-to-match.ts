import type { Match } from 'csdm/common/types/match';
import type { MatchRow } from 'csdm/node/database/matches/match-table';
import { fetchChecksumTagIds } from '../tags/fetch-checksum-tag-ids';
import type { Team } from '../../../common/types/team';
import type { CollateralKillPerMatch } from './fetch-collateral-kill-count-per-match';

export async function matchRowToMatch(
  row: MatchRow,
  teamA: Team,
  teamB: Team,
  collateralKillCountPerMatch: CollateralKillPerMatch,
  comment: string | null,
): Promise<Match> {
  const tagIds = await fetchChecksumTagIds(row.checksum);
  return {
    checksum: row.checksum,
    demoFilePath: row.demo_path,
    game: row.game,
    name: row.name,
    source: row.source,
    type: row.type,
    mapName: row.map_name,
    clientName: row.client_name,
    serverName: row.server_name,
    tickCount: row.tick_count,
    date: row.date.toUTCString(),
    killCount: row.kill_count,
    assistCount: row.assist_count,
    deathCount: row.death_count,
    collateralKillCount: collateralKillCountPerMatch[row.checksum] ?? 0,
    duration: row.duration,
    analyzeDate: row.analyze_date.toUTCString(),
    shotCount: row.shot_count,
    winnerName: row.winner_name,
    winnerSide: row.winner_side,
    frameRate: row.framerate,
    tickrate: row.tickrate,
    gameMode: row.game_mode_str,
    isRanked: row.is_ranked,
    maxRounds: row.max_rounds,
    shareCode: row.share_code,
    hasVacLiveBan: row.has_vac_live_ban,
    teamA,
    teamB,
    blinds: [],
    bombsDefused: [],
    bombsPlanted: [],
    bombsExploded: [],
    chatMessages: [],
    clutches: [],
    damages: [],
    kills: [],
    players: [],
    playersEconomies: [],
    grenadePositions: [],
    playerPositions: [],
    chickenPositions: [],
    chickenDeaths: [],
    rounds: [],
    shots: [],
    comment: comment ?? '',
    tagIds,
  };
}
