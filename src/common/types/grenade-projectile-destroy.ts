import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type GrenadeProjectileDestroy = BaseEvent & {
  grenadeId: string;
  projectileId: string;
  grenadeName: GrenadeName;
  x: number;
  y: number;
  z: number;
  throwerSteamId: string;
  throwerName: string;
  throwerTeamName: string;
  throwerVelocityX: number;
  throwerVelocityY: number;
  throwerVelocityZ: number;
  throwerYaw: number;
  throwerPitch: number;
  throwerSide: TeamNumber;
};
