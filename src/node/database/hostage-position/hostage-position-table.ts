// 1 row per hostage and round with 2 timelines packed as big-endian binary. Columns are parallel arrays, the value at
// index i of x, y and z is the position at ticks[i]:
//
//   index | 0     | 1     | 2
//   ticks | 66    | 3596  | 3597
//   x     | 1357  | 1357  | 1360
//   y     | -585  | -585  | -580
//   z     | -159  | -159  | -159
//
// A position is stored only when it changes, the hostage didn't move between ticks 66 and 3596 in this example.
// The last tick is when the hostage disappeared or when the round ended.
// The state works the same way with state_ticks, it has a value only when the state changes:
//
//   index       | 0     | 1
//   state_ticks | 66    | 3590
//   states      | 0     | 1
//
// The state at a tick is the last state with a state tick lower than or equal to it.
export type HostagePositionTable = {
  match_checksum: string;
  round_number: number;
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
  state_ticks: Buffer;
  states: Buffer;
};
