import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';

export type Coordinates = { x: number; y: number; z: number };

export type GrenadeThrow = {
  id: string;
  tick: number;
  roundNumber: number;
  projectileId: string;
  grenadeName: GrenadeName;
  positions: Coordinates[];
  throwerSteamId: string;
  throwerName: string;
  throwerSide: TeamNumber;
  throwerVelocityX: number;
  throwerVelocityY: number;
  throwerVelocityZ: number;
  throwerYaw: number;
  throwerPitch: number;
};
