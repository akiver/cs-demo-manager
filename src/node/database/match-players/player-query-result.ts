import type { MatchPlayerRow } from './match-player-table';

export type PlayerQueryResult = MatchPlayerRow & {
  wallbang_kill_count: number;
  no_scope_kill_count: number;
  last_ban_date: Date | null;
  avatar: string | null;
};
