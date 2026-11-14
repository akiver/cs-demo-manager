import type { WeaponName } from 'csdm/common/types/counter-strike';

export type GrenadeBuy = {
  playerSteamId: string;
  weaponName: WeaponName;
  weaponUniqueId: string;
};
