import type { WeaponName, TeamNumber, WeaponType } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type Damage = BaseEvent & {
  healthDamage: number;
  armorDamage: number;
  victimHealth: number;
  victimNewHealth: number;
  victimArmor: number;
  victimNewArmor: number;
  isVictimControllingBot: boolean;
  hitgroup: number;
  weaponName: WeaponName;
  weaponType: WeaponType;
  attackerSteamId: string;
  attackerSide: TeamNumber;
  attackerTeamName: string;
  isAttackerControllingBot: boolean;
  victimSteamId: string;
  victimSide: TeamNumber;
  victimTeamName: string;
  weaponUniqueId: string;
};
