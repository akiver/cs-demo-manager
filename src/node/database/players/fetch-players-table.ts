import { type Expression, type SqlBool } from 'kysely';
import type { Game, Rank } from 'csdm/common/types/counter-strike';
import type { PlayerTable } from 'csdm/common/types/player-table';
import { db } from 'csdm/node/database/database';
import type { PlayersTableFilter } from './players-table-filter';
import { BanFilter } from 'csdm/common/types/ban-filter';

type PlayersStatsResult = {
  steamId: string;
  killCount: number;
  assistCount: number;
  deathCount: number;
  headshotCount: number;
  mvpCount: number;
  headshotPercentage: number;
  utilityDamage: number;
  averageDamagePerRound: number;
  utilityDamagePerRound: number;
  killDeathRatio: number;
  kast: number;
  matchCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
  hltvRating: number;
  hltvRating2: number;
  comment: string | null;
};
type LastPlayersDataResult = {
  steamId: string;
  rank: Rank;
  game: Game;
  name: string;
  lastKnownName: string | null;
  avatar: string | null;
  lastBanDate: Date | null;
  lastMatchDate: Date;
  vacBanCount: number | null;
  gameBanCount: number | null;
  isCommunityBanned: boolean | null;
};

async function fetchPlayersStats(filter: PlayersTableFilter): Promise<PlayersStatsResult[]> {
  const { count, sum, avg } = db.fn;
  let query = db
    .selectFrom('players')
    .select([
      'players.steam_id as steamId',
      sum<number>('kill_count').as('killCount'),
      sum<number>('death_count').as('deathCount'),
      avg<number>('kill_death_ratio').as('killDeathRatio'),
      sum<number>('assist_count').as('assistCount'),
      sum<number>('headshot_count').as('headshotCount'),
      sum<number>('three_kill_count').as('threeKillCount'),
      sum<number>('four_kill_count').as('fourKillCount'),
      sum<number>('five_kill_count').as('fiveKillCount'),
      sum<number>('mvp_count').as('mvpCount'),
      sum<number>('utility_damage').as('utilityDamage'),
      avg<number>('headshot_percentage').as('headshotPercentage'),
      avg<number>('utility_damage_per_round').as('utilityDamagePerRound'),
      avg<number>('kast').as('kast'),
      avg<number>('hltv_rating').as('hltvRating'),
      avg<number>('hltv_rating_2').as('hltvRating2'),
      avg<number>('average_damage_per_round').as('averageDamagePerRound'),
      count<number>('match_checksum').as('matchCount'),
    ])
    .leftJoin('player_comments', 'player_comments.steam_id', 'players.steam_id')
    .select('player_comments.comment')
    .groupBy(['players.steam_id', 'player_comments.comment']);

  if (filter.bans.length > 0) {
    query = query
      .innerJoin('steam_accounts', 'steam_accounts.steam_id', 'players.steam_id')
      .where(({ eb, or, and }) => {
        const filters: Expression<SqlBool>[] = [];

        if (filter.bans.includes(BanFilter.None)) {
          filters.push(
            and([eb('vac_ban_count', '=', 0), eb('game_ban_count', '=', 0), eb('is_community_banned', '=', false)]),
          );
        }

        if (filter.bans.includes(BanFilter.VacBanned)) {
          filters.push(eb('vac_ban_count', '>', 0));
        }

        if (filter.bans.includes(BanFilter.GameBanned)) {
          filters.push(eb('game_ban_count', '>', 0));
        }

        if (filter.bans.includes(BanFilter.CommunityBanned)) {
          filters.push(eb('is_community_banned', '=', true));
        }

        return or(filters);
      });
  }

  const playersStats: PlayersStatsResult[] = await query.execute();

  return playersStats;
}

async function fetchLastPlayersData(steamIds: string[]): Promise<LastPlayersDataResult[]> {
  if (steamIds.length === 0) {
    return [];
  }

  const lastPlayersData: LastPlayersDataResult[] = await db
    .selectFrom('players')
    .select(['players.steam_id as steamId', 'players.name as name', 'players.rank as rank'])
    .leftJoin('steam_accounts', 'steam_accounts.steam_id', 'players.steam_id')
    .select([
      'steam_accounts.name as lastKnownName',
      'avatar',
      'last_ban_date as lastBanDate',
      'is_community_banned as isCommunityBanned',
      'vac_ban_count as vacBanCount',
      'game_ban_count as gameBanCount',
      'economy_ban as economyBan',
    ])
    .innerJoin('matches', 'matches.checksum', 'players.match_checksum')
    .select(['matches.date as lastMatchDate', 'matches.game as game'])
    .where('players.steam_id', 'in', steamIds)
    .groupBy([
      'matches.checksum',
      'players.steam_id',
      'players.name',
      'players.rank',
      'steam_accounts.name',
      'steam_accounts.avatar',
      'lastBanDate',
      'isCommunityBanned',
      'vacBanCount',
      'gameBanCount',
      'economyBan',
    ])
    .orderBy('matches.date', 'desc')
    .execute();

  return lastPlayersData;
}

function buildPlayersTable(
  playersStats: PlayersStatsResult[],
  lastPlayersData: LastPlayersDataResult[],
): PlayerTable[] {
  const players: PlayerTable[] = [];
  for (const playerStats of playersStats) {
    const lastPlayerData = lastPlayersData.find((row) => {
      return row.steamId === playerStats.steamId;
    });
    if (lastPlayerData) {
      players.push({
        ...playerStats,
        name: lastPlayerData.lastKnownName ?? lastPlayerData.name,
        avatar: lastPlayerData.avatar,
        rank: lastPlayerData.rank,
        game: lastPlayerData.game,
        lastBanDate: lastPlayerData.lastBanDate?.toUTCString() ?? null,
        lastMatchDate: lastPlayerData.lastMatchDate?.toUTCString() ?? null,
        isVacBanned: lastPlayerData.vacBanCount ? lastPlayerData.vacBanCount > 0 : false,
        isGameBanned: lastPlayerData.gameBanCount ? lastPlayerData.gameBanCount > 0 : false,
        isCommunityBanned: lastPlayerData.isCommunityBanned ?? false,
        comment: playerStats.comment ?? '',
      });
    } else {
      logger.warn(`Data for player with SteamID ${playerStats.steamId} not found while fetching players`);
    }
  }

  return players;
}

export async function fetchPlayersTable(filter: PlayersTableFilter): Promise<PlayerTable[]> {
  const playersStats = await fetchPlayersStats(filter);
  const steamIds = playersStats.map((player) => player.steamId);
  const lastPlayersData: LastPlayersDataResult[] = await fetchLastPlayersData(steamIds);
  const players: PlayerTable[] = buildPlayersTable(playersStats, lastPlayersData);

  return players;
}
