import type { TeamNumber } from 'csdm/common/types/counter-strike';

// Positions of an alive player during a round sampled once per second, used by the positions heatmaps.
// It's a lightweight version of the player_positions table (around 1% of its size) that makes reading the positions of
// many matches affordable. 1 row per player and round, written from the player_positions rows after a match insertion.
// Values are packed as big-endian binary like the player_positions table: int32 for ticks and float32 for coordinates.
export type PlayerPositionSampleTable = {
  match_checksum: string;
  round_number: number;
  player_steam_id: string;
  side: TeamNumber;
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
};
