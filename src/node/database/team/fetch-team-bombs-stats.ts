import { db } from '../database';
import { applyMatchFilters } from '../match/apply-match-filters';
import type { TeamFilters } from './team-filters';
import type { TeamBombsStats } from 'csdm/common/types/team-bombs-stats';

export async function fetchTeamBombsStats(filters: TeamFilters): Promise<TeamBombsStats> {
  const teamName = filters.name;

  const query = db
    .with('team_rounds', (db) => {
      let query = db
        .selectFrom('rounds')
        .select(['rounds.match_checksum', 'rounds.number as round_number', 'rounds.winner_name'])
        .leftJoin('matches', 'matches.checksum', 'rounds.match_checksum')
        .where(({ eb, or }) => {
          return or([eb('rounds.team_a_name', '=', teamName), eb('rounds.team_b_name', '=', teamName)]);
        });

      query = applyMatchFilters(query, filters);

      return query;
    })
    .with('bomb_exploded_rounds', (db) => {
      let query = db
        .selectFrom('bombs_exploded')
        .select(['bombs_exploded.match_checksum', 'bombs_exploded.round_number'])
        .leftJoin('matches', 'matches.checksum', 'bombs_exploded.match_checksum');

      query = applyMatchFilters(query, filters);

      return query;
    })
    .with('bomb_defused_rounds', (db) => {
      let query = db
        .selectFrom('bombs_defused')
        .select(['bombs_defused.match_checksum', 'bombs_defused.round_number'])
        .leftJoin('matches', 'matches.checksum', 'bombs_defused.match_checksum');

      query = applyMatchFilters(query, filters);

      return query;
    })
    .with('bomb_plants', (db) => {
      let query = db
        .selectFrom('bombs_planted')
        .select(['bombs_planted.match_checksum', 'bombs_planted.round_number', 'bombs_planted.site'])
        .innerJoin('players', (join) =>
          join.on((eb) =>
            eb.and([
              eb('bombs_planted.match_checksum', '=', eb.ref('players.match_checksum')),
              eb('bombs_planted.planter_steam_id', '=', eb.ref('players.steam_id')),
            ]),
          ),
        )
        .leftJoin('matches', 'matches.checksum', 'bombs_planted.match_checksum')
        .where('players.team_name', '=', teamName);

      query = applyMatchFilters(query, filters);

      return query;
    })
    .with('bomb_plants_enemy', (db) => {
      let query = db
        .selectFrom('bombs_planted')
        .select(['bombs_planted.match_checksum', 'bombs_planted.round_number', 'bombs_planted.site'])
        .innerJoin('players', (join) =>
          join.on((eb) =>
            eb.and([
              eb('bombs_planted.match_checksum', '=', eb.ref('players.match_checksum')),
              eb('bombs_planted.planter_steam_id', '=', eb.ref('players.steam_id')),
            ]),
          ),
        )
        .leftJoin('matches', 'matches.checksum', 'bombs_planted.match_checksum')
        .where('players.team_name', '!=', teamName);

      query = applyMatchFilters(query, filters);

      return query;
    })
    .selectFrom('team_rounds')
    .select((eb) => {
      return [
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsWonDueToBombExplosion'))
          .innerJoin('bomb_exploded_rounds', (join) =>
            join.on((eb) =>
              eb.and([
                eb('team_rounds.match_checksum', '=', eb.ref('bomb_exploded_rounds.match_checksum')),
                eb('team_rounds.round_number', '=', eb.ref('bomb_exploded_rounds.round_number')),
              ]),
            ),
          )
          .where('team_rounds.winner_name', '=', teamName)
          .as('roundsWonDueToBombExplosion'),
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsWonDueToDefusal'))
          .innerJoin('bomb_defused_rounds', (join) =>
            join.on((eb) =>
              eb.and([
                eb('team_rounds.match_checksum', '=', eb.ref('bomb_defused_rounds.match_checksum')),
                eb('team_rounds.round_number', '=', eb.ref('bomb_defused_rounds.round_number')),
              ]),
            ),
          )
          .where('team_rounds.winner_name', '=', teamName)
          .as('roundsWonDueToDefusal'),
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsLostDueToBombExplosion'))
          .innerJoin('bomb_exploded_rounds', (join) =>
            join.on((eb) =>
              eb.and([
                eb('team_rounds.match_checksum', '=', eb.ref('bomb_exploded_rounds.match_checksum')),
                eb('team_rounds.round_number', '=', eb.ref('bomb_exploded_rounds.round_number')),
              ]),
            ),
          )
          .where('team_rounds.winner_name', '!=', teamName)
          .as('roundsLostDueToBombExplosion'),
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsLostDueToDefusal'))
          .innerJoin('bomb_defused_rounds', (join) =>
            join.on((eb) =>
              eb.and([
                eb('team_rounds.match_checksum', '=', eb.ref('bomb_defused_rounds.match_checksum')),
                eb('team_rounds.round_number', '=', eb.ref('bomb_defused_rounds.round_number')),
              ]),
            ),
          )
          .where('team_rounds.winner_name', '!=', teamName)
          .as('roundsLostDueToDefusal'),
        eb.selectFrom('bomb_plants').select(eb.fn.countAll<number>().as('plantCount')).as('plantCount'),
        eb
          .selectFrom('bomb_plants')
          .select(eb.fn.countAll<number>().as('plantCountSiteA'))
          .where('bomb_plants.site', '=', 'A')
          .as('plantCountSiteA'),
        eb
          .selectFrom('bomb_plants')
          .select(eb.fn.countAll<number>().as('plantCountSiteB'))
          .where('bomb_plants.site', '=', 'B')
          .as('plantCountSiteB'),
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsWonByPlayerDeaths'))
          .where('team_rounds.winner_name', '=', teamName)
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'in',
              selectFrom('bomb_plants')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'not in',
              selectFrom('bomb_exploded_rounds')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'not in',
              selectFrom('bomb_defused_rounds')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .as('roundsWonByPlayerDeaths'),
        eb
          .selectFrom('team_rounds')
          .select(eb.fn.count<number>('team_rounds.winner_name').as('roundsLostDueToPlayerDeaths'))
          .where('team_rounds.winner_name', '!=', teamName)
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'in',
              selectFrom('bomb_plants_enemy')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'not in',
              selectFrom('bomb_exploded_rounds')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .where(({ eb, refTuple, selectFrom }) =>
            eb(
              refTuple('team_rounds.match_checksum', 'team_rounds.round_number'),
              'not in',
              selectFrom('bomb_defused_rounds')
                .select(['match_checksum', 'round_number'])
                .$asTuple('match_checksum', 'round_number'),
            ),
          )
          .as('roundsLostDueToPlayerDeaths'),
      ];
    });

  const row = await query.executeTakeFirst();

  const stats: TeamBombsStats = {
    plantCount: row?.plantCount ?? 0,
    plantCountSiteA: row?.plantCountSiteA ?? 0,
    plantCountSiteB: row?.plantCountSiteB ?? 0,
    roundsWonDueToBombExplosion: row?.roundsWonDueToBombExplosion ?? 0,
    roundsWonDueToDefusal: row?.roundsWonDueToDefusal ?? 0,
    roundsLostDueToBombExplosion: row?.roundsLostDueToBombExplosion ?? 0,
    roundsLostDueToDefusal: row?.roundsLostDueToDefusal ?? 0,
    roundsWonByPlayerDeaths: row?.roundsWonByPlayerDeaths ?? 0,
    roundsLostDueToPlayerDeaths: row?.roundsLostDueToPlayerDeaths ?? 0,
  };

  return stats;
}
