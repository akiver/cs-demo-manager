import type { MatchFilters } from '../match/apply-match-filters';

export type TeamFilters = MatchFilters & {
  name: string;
};
