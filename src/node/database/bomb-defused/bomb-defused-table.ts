import type { Generated, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type BombDefusedTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  site: string;
  defuser_steam_id: string;
  defuser_name: string;
  is_defuser_controlling_bot: boolean;
  x: number;
  y: number;
  z: number;
  ct_alive_count: number;
  t_alive_count: number;
};

export type BombDefusedRow = Selectable<BombDefusedTable>;
