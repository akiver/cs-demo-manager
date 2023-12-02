import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { BaseEvent } from 'csdm/common/types/base-event';

export type FlashbangExplode = BaseEvent & {
  grenadeId: string;
  projectileId: string;
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
