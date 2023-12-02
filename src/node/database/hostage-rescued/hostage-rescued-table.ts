import type { Generated } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type HostageRescuedTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  hostage_entity_id: number;
  player_steam_id: string;
  is_player_controlling_bot: boolean;
  x: number;
  y: number;
  z: number;
};
