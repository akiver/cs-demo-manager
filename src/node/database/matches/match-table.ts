import type { Selectable } from 'kysely';
import type { DemoSource, DemoType, GameType, TeamNumber, Game, GameMode } from 'csdm/common/types/counter-strike';

export type MatchTable = {
  checksum: string;
  demo_path: string;
  game: Game;
  name: string;
  source: DemoSource;
  type: DemoType;
  server_name: string;
  client_name: string;
  tick_count: number;
  tickrate: number;
  framerate: number;
  duration: number;
  network_protocol: number;
  build_number: number;
  game_type: GameType;
  game_mode: number;
  game_mode_str: GameMode;
  is_ranked: boolean;
  map_name: string;
  kill_count: number;
  death_count: number;
  assist_count: number;
  shot_count: number;
  winner_name: string;
  winner_side: TeamNumber;
  share_code: string;
  date: Date;
  analyze_date: Date;
  overtime_count: number;
  max_rounds: number;
  has_vac_live_ban: boolean;
};

export type MatchRow = Selectable<MatchTable>;
