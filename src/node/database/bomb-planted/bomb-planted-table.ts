import type { Generated, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type BombPlantedTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  site: string;
  planter_steam_id: string;
  planter_name: string;
  is_planter_controlling_bot: boolean;
  x: number;
  y: number;
  z: number;
};

export type BombPlantedRow = Selectable<BombPlantedTable>;
