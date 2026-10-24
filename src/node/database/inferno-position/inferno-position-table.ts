// 1 row per inferno, its position never changes, only its 2D convex hull changes when fires ignite or extinguish.
// ticks is packed as big-endian int32, it's a parallel array of convex_hulls_2d:
//
//   index           | 0          | 1                     | 2
//   ticks           | 4556       | 4564                  | 5836
//   convex_hulls_2d | "659,-133" | "695,-192,659,-133"   | ""
//
// A convex hull is stored only when it changes, it's empty when the inferno has no active fires.
// The last tick is when the inferno disappeared.
export type InfernoPositionTable = {
  match_checksum: string;
  round_number: number;
  unique_id: string;
  thrower_steam_id: string;
  thrower_name: string;
  x: number;
  y: number;
  z: number;
  // Tick of each convex hull packed as big-endian int32.
  ticks: Buffer;
  // Convex hulls as a list of points "x1,y1,x2,y2...", empty when the inferno has no active fires.
  convex_hulls_2d: string[];
};
