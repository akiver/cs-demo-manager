import type { Generated, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type ChickenDeathTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  tick: number;
  frame: number;
  round_number: number;
  weapon_name: string;
  killer_steam_id: string;
};

export type ChickenDeathRow = Selectable<ChickenDeathTable>;
