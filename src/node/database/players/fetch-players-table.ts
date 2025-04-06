import { sql, type Expression, type SqlBool } from 'kysely';
import type { PlayerTable } from 'csdm/common/types/player-table';
import { db } from 'csdm/node/database/database';
import type { PlayersTableFilter } from './players-table-filter';
import { BanFilter } from 'csdm/common/types/ban-filter';
import { fetchPlayersTags } from 'csdm/node/database/tags/fetch-players-tags';
import type { SteamAccountTagTable } from 'csdm/node/database/tags/steam-account-tag-table';
import { fetchLastPlayersData, type LastPlayersData } from './fetch-last-players-data';

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

async function fetchPlayersStats(filter: PlayersTableFilter): Promise<PlayersStatsResult[]> {
  const { count, sum, avg } = db.fn;
  let query = db
    .selectFrom('players')
    .select([
      'players.steam_id as steamId',
      sum<number>('players.kill_count').as('killCount'),
      sum<number>('players.death_count').as('deathCount'),
      sql<number>`SUM(players.kill_count)::NUMERIC / NULLIF(SUM(players.death_count), 0)::NUMERIC`.as('killDeathRatio'),
      sum<number>('players.assist_count').as('assistCount'),
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
    .leftJoin('matches', 'matches.checksum', 'players.match_checksum')
    .groupBy(['players.steam_id', 'player_comments.comment']);

  const { startDate, endDate, tagIds } = filter;
  if (startDate && endDate) {
    query = query.where(sql<boolean>`matches.date between ${startDate} and ${endDate}`);
  }

  if (Array.isArray(tagIds) && tagIds.length > 0) {
    query = query
      .leftJoin('steam_account_tags', 'steam_account_tags.steam_id', 'players.steam_id')
      .where('steam_account_tags.tag_id', 'in', tagIds);
  }

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

function buildPlayersTable(
  playersStats: PlayersStatsResult[],
  lastPlayersData: LastPlayersData[],
  tags: SteamAccountTagTable[],
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
        lastBanDate: lastPlayerData.lastBanDate?.toISOString() ?? null,
        lastMatchDate: lastPlayerData.lastMatchDate?.toISOString() ?? null,
        isVacBanned: lastPlayerData.vacBanCount ? lastPlayerData.vacBanCount > 0 : false,
        isGameBanned: lastPlayerData.gameBanCount ? lastPlayerData.gameBanCount > 0 : false,
        isCommunityBanned: lastPlayerData.isCommunityBanned ?? false,
        comment: playerStats.comment ?? '',
        tagIds: tags
          .filter((row) => {
            return row.steam_id === playerStats.steamId;
          })
          .map((tag) => String(tag.tag_id)),
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
  const [lastPlayersData, tags] = await Promise.all([fetchLastPlayersData(steamIds), fetchPlayersTags()]);
  const players = buildPlayersTable(playersStats, lastPlayersData, tags);

  return players;
}
