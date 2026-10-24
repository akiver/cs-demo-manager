type InfernoConvexHull = {
  tick: number;
  // Points of the 2D convex hull [x1, y1, x2, y2...], empty when the inferno has no active fires
  points: number[];
};

// The position of an inferno never changes, only its convex hull changes when fires ignite or extinguish.
// A convex hull is stored only when it changes, the last one is when the inferno disappeared.
export type InfernoTimeline = {
  uniqueId: string;
  throwerSteamId: string;
  throwerName: string;
  x: number;
  y: number;
  z: number;
  convexHulls: InfernoConvexHull[];
};
