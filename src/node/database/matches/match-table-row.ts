import type { MatchRow } from 'csdm/node/database/matches/match-table';
import type { DemoRow } from '../demos/demo-table';

export type MatchTableRow = DemoRow &
  MatchRow & {
    banned_player_count: number | null;
    comment: string | null;
    teamAName: string;
    teamAScore: number;
    teamBName: string;
    teamBScore: number;
    fiveKillCount: number;
    fourKillCount: number;
    threeKillCount: number;
    hltvRating2: number;
  };
