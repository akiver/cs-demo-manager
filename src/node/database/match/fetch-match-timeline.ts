import { db } from 'csdm/node/database/database';
import type { EconomyType, RoundEndReason, TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import { getRoundDurationSeconds } from './get-round-duration-seconds';

type MatchTimelineRoundTeam = {
  name: string;
  side: TeamNumber;
  // The team's score when the round starts.
  score: number;
  economyType: EconomyType;
};

export type MatchTimeline = {
  // How long the round clock runs once the freeze time ends, see getRoundDurationSeconds.
  roundDurationSeconds: number;
  rounds: {
    startTick: number;
    freezeTimeEndTick: number;
    // When the round was won, before the time between rounds.
    endTick: number;
    winnerSide: TeamNumber;
    endReason: RoundEndReason;
    teamA: MatchTimelineRoundTeam;
    teamB: MatchTimelineRoundTeam;
  }[];
  kills: {
    tick: number;
    killerSide: TeamNumber;
    victimSide: TeamNumber;
    killerSteamId: string;
    victimSteamId: string;
    killerName: string;
    victimName: string;
    weaponName: WeaponName;
    isHeadshot: boolean;
    penetratedObjects: number;
  }[];
  bombPlants: {
    tick: number;
    site: string;
    planterSteamId: string;
  }[];
  bombDefuses: {
    tick: number;
    site: string;
    defuserSteamId: string;
  }[];
  bombExplosions: {
    tick: number;
    site: string;
  }[];
};

export async function fetchMatchTimeline(checksum: string): Promise<MatchTimeline> {
  const [match, roundRows, killRows, bombPlantRows, bombDefuseRows, bombExplosionRows] = await Promise.all([
    db
      .selectFrom('matches')
      .innerJoin('demos', 'demos.checksum', 'matches.checksum')
      .select(['matches.game_mode_str', 'demos.tickrate'])
      .where('matches.checksum', '=', checksum)
      .executeTakeFirst(),
    db
      .selectFrom('rounds')
      .select([
        'start_tick',
        'freeze_time_end_tick',
        'end_tick',
        'winner_side',
        'end_reason',
        'team_a_name',
        'team_a_side',
        'team_a_score',
        'team_a_economy_type',
        'team_b_name',
        'team_b_side',
        'team_b_score',
        'team_b_economy_type',
      ])
      .where('match_checksum', '=', checksum)
      .orderBy('number')
      .execute(),
    db
      .selectFrom('kills')
      .select([
        'tick',
        'killer_side',
        'victim_side',
        'killer_steam_id',
        'victim_steam_id',
        'killer_name',
        'victim_name',
        'weapon_name',
        'is_headshot',
        'penetrated_objects',
      ])
      .where('match_checksum', '=', checksum)
      .orderBy('tick')
      .execute(),
    db
      .selectFrom('bombs_planted')
      .select(['tick', 'site', 'planter_steam_id'])
      .where('match_checksum', '=', checksum)
      .orderBy('tick')
      .execute(),
    db
      .selectFrom('bombs_defused')
      .select(['tick', 'site', 'defuser_steam_id'])
      .where('match_checksum', '=', checksum)
      .orderBy('tick')
      .execute(),
    db
      .selectFrom('bombs_exploded')
      .select(['tick', 'site'])
      .where('match_checksum', '=', checksum)
      .orderBy('tick')
      .execute(),
  ]);

  const roundDurationSeconds = getRoundDurationSeconds(
    roundRows.map((row) => {
      return {
        freezeTimeEndTick: row.freeze_time_end_tick,
        endTick: row.end_tick,
        endReason: row.end_reason,
      };
    }),
    match?.tickrate ?? 0,
    match?.game_mode_str ?? '',
  );

  return {
    roundDurationSeconds,
    rounds: roundRows.map((row) => {
      const teamAWon = row.winner_side === row.team_a_side;
      const teamBWon = row.winner_side === row.team_b_side;

      return {
        startTick: row.start_tick,
        freezeTimeEndTick: row.freeze_time_end_tick,
        endTick: row.end_tick,
        winnerSide: row.winner_side,
        endReason: row.end_reason,
        teamA: {
          name: row.team_a_name,
          side: row.team_a_side,
          score: teamAWon ? Math.max(0, row.team_a_score - 1) : row.team_a_score,
          economyType: row.team_a_economy_type,
        },
        teamB: {
          name: row.team_b_name,
          side: row.team_b_side,
          score: teamBWon ? Math.max(0, row.team_b_score - 1) : row.team_b_score,
          economyType: row.team_b_economy_type,
        },
      };
    }),
    kills: killRows.map((row) => {
      return {
        tick: row.tick,
        killerSide: row.killer_side,
        victimSide: row.victim_side,
        killerSteamId: row.killer_steam_id,
        victimSteamId: row.victim_steam_id,
        killerName: row.killer_name,
        victimName: row.victim_name,
        weaponName: row.weapon_name,
        isHeadshot: row.is_headshot,
        penetratedObjects: row.penetrated_objects,
      };
    }),
    bombPlants: bombPlantRows.map((row) => {
      return {
        tick: row.tick,
        site: row.site,
        planterSteamId: row.planter_steam_id,
      };
    }),
    bombDefuses: bombDefuseRows.map((row) => {
      return {
        tick: row.tick,
        site: row.site,
        defuserSteamId: row.defuser_steam_id,
      };
    }),
    bombExplosions: bombExplosionRows.map((row) => {
      return {
        tick: row.tick,
        site: row.site,
      };
    }),
  };
}
