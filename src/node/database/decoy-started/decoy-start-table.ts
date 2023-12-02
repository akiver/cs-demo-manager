import type { Generated, Selectable } from 'kysely';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type DecoyStartTable = {
  id: Generated<ColumnID>;
  frame: number;
  tick: number;
  round_number: number;
  grenade_id: string;
  projectile_id: string;
  x: number;
  y: number;
  z: number;
  thrower_steam_id: string;
  thrower_name: string;
  thrower_side: TeamNumber;
  thrower_team_name: string;
  thrower_velocity_x: number;
  thrower_velocity_y: number;
  thrower_velocity_z: number;
  thrower_yaw: number;
  thrower_pitch: number;
  match_checksum: string;
};

export type DecoyStartRow = Selectable<DecoyStartTable>;
