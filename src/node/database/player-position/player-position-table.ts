import type { Generated, Selectable } from 'kysely';
import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type PlayerPositionTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  player_steam_id: string;
  player_name: string;
  is_alive: boolean;
  x: number;
  y: number;
  z: number;
  yaw: number;
  flash_duration_remaining: number;
  side: TeamNumber;
  health: number;
  money: number;
  armor: number;
  has_helmet: boolean;
  has_bomb: boolean;
  has_defuse_kit: boolean;
  is_ducking: boolean;
  is_airborne: boolean;
  is_scoping: boolean;
  is_defusing: boolean;
  is_planting: boolean;
  is_grabbing_hostage: boolean;
  active_weapon_name: WeaponName;
  equipments: string | null;
  grenades: string | null;
  pistols: string | null;
  smgs: string | null;
  rifles: string | null;
  heavy: string | null;
};

export type PlayerPositionRow = Selectable<PlayerPositionTable>;
