import type { Generated, Selectable } from 'kysely';
import type { TeamNumber, WeaponName, WeaponType } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type DamageTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  health_damage: number;
  armor_damage: number;
  victim_damage: number;
  victim_health: number;
  victim_new_health: number;
  victim_armor: number;
  victim_new_armor: number;
  is_victim_controlling_bot: boolean;
  attacker_steam_id: string;
  attacker_side: TeamNumber;
  attacker_team_name: string;
  is_attacker_controlling_bot: boolean;
  victim_steam_id: string;
  victim_side: TeamNumber;
  victim_team_name: string;
  hitgroup: number;
  weapon_name: WeaponName;
  weapon_type: WeaponType;
  weapon_unique_id: string;
};

export type DamageRow = Selectable<DamageTable>;
