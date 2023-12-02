import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type GrenadePosition = BaseEvent & {
  grenadeId: string;
  projectileId: string;
  grenadeName: GrenadeName;
  x: number;
  y: number;
  z: number;
  throwerName: string;
  throwerSteamId: string;
  throwerTeamName: string;
  throwerSide: TeamNumber;
  throwerVelocityX: number;
  throwerVelocityY: number;
  throwerVelocityZ: number;
  throwerYaw: number;
  throwerPitch: number;
};
