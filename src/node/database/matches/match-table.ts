import type { Selectable } from 'kysely';
import type { GameType, TeamNumber, GameMode } from 'csdm/common/types/counter-strike';

export type MatchTable = {
  checksum: string;
  demo_path: string;
  game_type: GameType;
  game_mode: number;
  game_mode_str: GameMode;
  is_ranked: boolean;
  kill_count: number;
  death_count: number;
  assist_count: number;
  shot_count: number;
  winner_name: string;
  winner_side: TeamNumber;
  analyze_date: Date;
  overtime_count: number;
  max_rounds: number;
  has_vac_live_ban: boolean;
};

export type MatchRow = Selectable<MatchTable>;
