import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';
import type { TimelinePosition } from 'csdm/common/types/timeline-position';

// Positions of a grenade projectile sorted by tick.
// A position is stored only when it changes, the last one is when the projectile disappeared.
export type GrenadeTimeline = {
  grenadeId: string;
  projectileId: string;
  grenadeName: GrenadeName;
  throwerSteamId: string;
  throwerName: string;
  throwerSide: TeamNumber;
  throwerTeamName: string;
  // Thrower values at the time of the throw
  throwerVelocityX: number;
  throwerVelocityY: number;
  throwerVelocityZ: number;
  throwerYaw: number;
  throwerPitch: number;
  positions: TimelinePosition[];
};
