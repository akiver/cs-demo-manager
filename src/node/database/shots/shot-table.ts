import type { Generated, Selectable } from 'kysely';
import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type ShotTable = {
  id: Generated<ColumnID>;
  frame: number;
  tick: number;
  round_number: number;
  weapon_name: WeaponName;
  weapon_id: string;
  projectile_id: string; // Available only for grenades
  x: number;
  y: number;
  z: number;
  player_name: string;
  player_steam_id: string;
  player_team_name: string;
  player_side: TeamNumber;
  is_player_controlling_bot: boolean;
  player_velocity_x: number;
  player_velocity_y: number;
  player_velocity_z: number;
  player_yaw: number;
  player_pitch: number;
  recoil_index: number;
  aim_punch_angle_x: number;
  aim_punch_angle_y: number;
  view_punch_angle_x: number;
  view_punch_angle_y: number;
  match_checksum: string;
};

export type ShotRow = Selectable<ShotTable>;
