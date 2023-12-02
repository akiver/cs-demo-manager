import { DatabaseError } from 'pg';
import type { FaceitMatch } from 'csdm/common/types/faceit-match';
import { db } from 'csdm/node/database/database';
import { PostgresqlErrorCode } from '../postgresql-error-code';
import type { InsertableFaceitMatchPlayer } from './faceit-match-player-table';
import type { InsertableFaceitMatchTeam } from './faceit-match-team-table';
import type { FaceitMatchRow } from './faceit-match-table';

function matchToRow(match: FaceitMatch): FaceitMatchRow {
  return {
    id: match.id,
    game: match.game,
    date: new Date(match.date),
    duration_in_seconds: match.durationInSeconds,
    demo_url: match.demoUrl,
    map_name: match.mapName,
    url: match.url,
    game_mode: match.gameMode,
    winner_id: match.winnerId,
    winner_name: match.winnerName,
  };
}

function buildTeamRows(match: FaceitMatch): InsertableFaceitMatchTeam[] {
  return match.teams.map((team) => {
    return {
      faceit_id: team.id,
      name: team.name,
      score: team.score,
      first_half_score: team.firstHalfScore,
      second_half_score: team.secondHalfScore,
      overtime_score: team.overtimeScore,
      faceit_match_id: match.id,
    };
  });
}

function buildPlayerRows(match: FaceitMatch): InsertableFaceitMatchPlayer[] {
  return match.players.map((player) => {
    return {
      faceit_id: player.id,
      name: player.name,
      avatar_url: player.avatarUrl,
      team_id: player.teamId,
      team_name: player.teamName,
      kill_count: player.killCount,
      assist_count: player.assistCount,
      death_count: player.deathCount,
      kill_death_ratio: player.killDeathRatio,
      kill_per_round: player.killPerRound,
      headshot_count: player.headshotCount,
      headshot_percentage: player.headshotPercentage,
      mvp_count: player.mvpCount,
      five_kill_count: player.fiveKillCount,
      four_kill_count: player.fourKillCount,
      three_kill_count: player.threeKillCount,
      faceit_match_id: match.id,
    };
  });
}

export async function insertFaceitMatch(match: FaceitMatch) {
  await db.transaction().execute(async (transaction) => {
    try {
      await transaction.insertInto('faceit_matches').values(matchToRow(match)).execute();
      await transaction.insertInto('faceit_match_teams').values(buildTeamRows(match)).execute();
      await transaction.insertInto('faceit_match_players').values(buildPlayerRows(match)).execute();
    } catch (error) {
      if (error instanceof DatabaseError) {
        switch (error.code) {
          case PostgresqlErrorCode.UniqueViolation:
            return;
        }
      }
      throw error;
    }
  });
}
