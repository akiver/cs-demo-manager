import type { Generated, Selectable } from 'kysely';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type ClutchTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  opponent_count: number;
  side: TeamNumber;
  won: boolean;
  clutcher_steam_id: string;
  clutcher_name: string;
  has_clutcher_survived: boolean;
  clutcher_kill_count: number;
};

export type ClutchRow = Selectable<ClutchTable>;
