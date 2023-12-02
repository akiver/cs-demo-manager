import type { Generated, Selectable } from 'kysely';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type HeGrenadeExplodeTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
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
};

export type HeGrenadeExplodeRow = Selectable<HeGrenadeExplodeTable>;
