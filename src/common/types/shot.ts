import type { TeamNumber, WeaponName } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type Shot = BaseEvent & {
  weaponName: WeaponName;
  weaponId: string;
  projectileId: string; // Available only for grenades
  x: number;
  y: number;
  z: number;
  playerName: string;
  playerSteamId: string;
  playerTeamName: string;
  playerSide: TeamNumber;
  isPlayerControllingBot: boolean;
  playerVelocityX: number;
  playerVelocityY: number;
  playerVelocityZ: number;
  playerYaw: number;
  playerPitch: number;
};
