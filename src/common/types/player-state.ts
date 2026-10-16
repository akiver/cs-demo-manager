import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';

// State of a player at a given tick, it's stored only when it changes.
export type PlayerState = {
  tick: number;
  playerSteamId: string;
  playerName: string;
  isAlive: boolean;
  side: TeamNumber;
  money: number;
  health: number;
  armor: number;
  hasHelmet: boolean;
  hasBomb: boolean;
  hasDefuseKit: boolean;
  isScoping: boolean;
  isDefusing: boolean;
  isPlanting: boolean;
  isGrabbingHostage: boolean;
  activeWeaponName: WeaponName;
  equipments: string;
  grenades: string;
  pistols: string;
  smgs: string;
  rifles: string;
  heavy: string;
};
