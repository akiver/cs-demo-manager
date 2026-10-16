// Movements (x, y, z, is_ducking...) and states (health, weapons...) of a player during a round.
// 1 row per player and round, movements are stored for each tick and states only when they change.
// Values are packed by the analyzer as big-endian binary: int32 for integers, float32 for decimals and uint8 for booleans.
//
// Columns are parallel arrays, the value at index i of a movement column is the value at ticks[i]:
//
//   index       | 0     | 1     | 2
//   ticks       | 1     | 2     | 3
//   x           | 100   | 120   | 145
//   y           | 50    | 52    | 55
//   is_ducking  | false | false | true
//
// State columns work the same way with state_ticks, but they only have a value when the state changes:
//
//   index       | 0     | 1     | 2
//   state_ticks | 1     | 40    | 95
//   health      | 100   | 73    | 0
//   is_alive    | true  | true  | false
//
// The state at a tick is the last state with a state tick lower than or equal to it, e.g. at tick 60 it's index 1.
export type PlayerPositionTable = {
  match_checksum: string;
  round_number: number;
  player_steam_id: string;
  player_name: string;
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
  yaw: Buffer;
  flash_duration_remaining: Buffer;
  is_ducking: Buffer;
  is_airborne: Buffer;
  state_ticks: Buffer;
  is_alive: Buffer;
  side: Buffer;
  money: Buffer;
  health: Buffer;
  armor: Buffer;
  has_helmet: Buffer;
  has_bomb: Buffer;
  has_defuse_kit: Buffer;
  is_scoping: Buffer;
  is_defusing: Buffer;
  is_planting: Buffer;
  is_grabbing_hostage: Buffer;
  active_weapon_name: string[];
  equipments: string[];
  grenades: string[];
  pistols: string[];
  smgs: string[];
  rifles: string[];
  heavy: string[];
};
