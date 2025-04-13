import { sql } from 'kysely';
import type { DemoSource, DemoType, Game, GameMode } from 'csdm/common/types/counter-strike';
import { RankingFilter } from 'csdm/common/types/ranking-filter';

export type MatchFilters = {
  startDate: string | undefined;
  endDate: string | undefined;
  demoSources: DemoSource[];
  demoTypes: DemoType[];
  games: Game[];
  ranking?: RankingFilter;
  gameModes: GameMode[];
  tagIds: string[];
  maxRounds: number[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMatchFilters(query: any, filters: MatchFilters) {
  if (filters.startDate && filters.endDate) {
    query = query.where(sql<boolean>`matches.date between ${filters.startDate} and ${filters.endDate}`);
  }

  if (filters.ranking && filters.ranking !== RankingFilter.All) {
    query = query.where('matches.is_ranked', '=', filters.ranking === RankingFilter.Ranked);
  }

  if (filters.demoSources.length > 0) {
    query = query.where('matches.source', 'in', filters.demoSources);
  }

  if (filters.games.length > 0) {
    query = query.where('matches.game', 'in', filters.games);
  }

  if (filters.demoTypes.length > 0) {
    query = query.where('matches.type', 'in', filters.demoTypes);
  }

  if (filters.gameModes.length > 0) {
    query = query.where('matches.game_mode_str', 'in', filters.gameModes);
  }

  if (filters.maxRounds.length > 0) {
    query = query.where('matches.max_rounds', 'in', filters.maxRounds);
  }

  if (filters.tagIds.length > 0) {
    query = query
      .leftJoin('checksum_tags', 'checksum_tags.checksum', 'matches.checksum')
      .where('checksum_tags.tag_id', 'in', filters.tagIds);
  }

  return query;
}
