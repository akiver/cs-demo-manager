import type { FaceitMatch, FaceitPlayer, FaceitTeam } from 'csdm/common/types/faceit-match';
import { getDownloadStatus } from 'csdm/node/download/get-download-status';
import type { FaceitMatchPlayerRow } from './faceit-match-player-table';
import type { FaceitMatchRow } from './faceit-match-table';
import type { FaceitMatchTeamRow } from './faceit-match-team-table';

function playerRowToPlayer(row: FaceitMatchPlayerRow): FaceitPlayer {
  return {
    id: row.faceit_id,
    assistCount: row.assist_count,
    avatarUrl: row.avatar_url,
    deathCount: row.death_count,
    fiveKillCount: row.five_kill_count,
    fourKillCount: row.four_kill_count,
    headshotCount: row.headshot_count,
    headshotPercentage: row.headshot_percentage,
    killCount: row.kill_count,
    killDeathRatio: row.kill_death_ratio,
    killPerRound: row.kill_per_round,
    mvpCount: row.mvp_count,
    name: row.name,
    teamId: row.team_id,
    teamName: row.team_name,
    threeKillCount: row.three_kill_count,
  };
}

function teamRowToTeam(row: FaceitMatchTeamRow): FaceitTeam {
  return {
    id: row.faceit_id,
    name: row.name,
    score: row.score,
    firstHalfScore: row.first_half_score,
    secondHalfScore: row.second_half_score,
    overtimeScore: row.overtime_score,
  };
}

export async function faceitMatchRowToFaceitMatch(
  row: FaceitMatchRow,
  playerRows: FaceitMatchPlayerRow[],
  teamRows: FaceitMatchTeamRow[],
  downloadFolderPath: string | undefined,
): Promise<FaceitMatch> {
  return {
    id: row.id,
    game: row.game,
    url: row.url,
    gameMode: row.game_mode,
    mapName: row.map_name,
    date: row.date.toISOString(),
    durationInSeconds: row.duration_in_seconds,
    demoUrl: row.demo_url,
    winnerId: row.winner_id,
    winnerName: row.winner_name,
    players: playerRows.map(playerRowToPlayer),
    teams: teamRows.map(teamRowToTeam),
    downloadStatus: await getDownloadStatus(downloadFolderPath, row.id, row.demo_url),
  };
}
