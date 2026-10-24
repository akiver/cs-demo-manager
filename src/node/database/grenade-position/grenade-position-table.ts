import type { GrenadeName, TeamNumber } from 'csdm/common/types/counter-strike';

// 1 row per grenade projectile, positions are packed as big-endian binary: int32 for ticks and float32 for x, y, z.
// Columns are parallel arrays, the value at index i of x, y and z is the position at ticks[i]:
//
//   index | 0     | 1     | 2
//   ticks | 100   | 101   | 160
//   x     | 450   | 470   | 470
//   y     | -120  | -110  | -110
//   z     | 64    | 70    | 70
//
// A position is stored only when it changes, the projectile didn't move between ticks 101 and 160 in this example.
// The last tick is when the projectile disappeared.
export type GrenadePositionTable = {
  match_checksum: string;
  round_number: number;
  grenade_id: string;
  projectile_id: string;
  grenade_name: GrenadeName;
  thrower_steam_id: string;
  thrower_name: string;
  thrower_side: TeamNumber;
  thrower_team_name: string;
  // Thrower values at the time of the throw
  thrower_velocity_x: number;
  thrower_velocity_y: number;
  thrower_velocity_z: number;
  thrower_yaw: number;
  thrower_pitch: number;
  // Values packed as big-endian binary.
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
};
