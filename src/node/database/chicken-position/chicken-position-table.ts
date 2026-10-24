// 1 row per chicken and round, positions are packed as big-endian binary.
// Columns are parallel arrays, the value at index i of x, y and z is the position at ticks[i]:
//
//   index | 0     | 1     | 2
//   ticks | 100   | 101   | 160
//   x     | 450   | 452   | 452
//   y     | -120  | -119  | -119
//   z     | 64    | 64    | 64
//
// A position is stored only when it changes, the chicken didn't move between ticks 101 and 160 in this example.
// The last tick is when the chicken disappeared (killed) or when the round ended.
export type ChickenPositionTable = {
  match_checksum: string;
  round_number: number;
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
};
