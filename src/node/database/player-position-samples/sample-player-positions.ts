import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { createDataView } from 'csdm/node/database/create-data-view';
import { packFloat32, packInt32 } from 'csdm/node/database/pack-values';
import type { PlayerPositionTable } from 'csdm/node/database/player-position/player-position-table';

type PackedPositions = Pick<PlayerPositionTable, 'ticks' | 'x' | 'y' | 'z' | 'state_ticks' | 'is_alive' | 'side'>;

type SamplingOptions = {
  // Minimum number of ticks between two samples
  sampleInterval: number;
  // Positions before this tick are ignored, typically the end of the freeze time
  startTick: number;
};

export type PlayerPositionSamples = {
  side: TeamNumber;
  ticks: Buffer;
  x: Buffer;
  y: Buffer;
  z: Buffer;
};

// Samples the positions of one player during one round: keeps at most one position per interval of ticks, only while
// the player is alive and from the start tick. Positions and states must be sorted by tick.
// Returns null when no position has been kept.
export function samplePlayerPositions(
  packed: PackedPositions,
  { sampleInterval, startTick }: SamplingOptions,
): PlayerPositionSamples | null {
  const ticks = createDataView(packed.ticks);
  const x = createDataView(packed.x);
  const y = createDataView(packed.y);
  const z = createDataView(packed.z);
  const stateTicks = createDataView(packed.state_ticks);
  const side = createDataView(packed.side);
  const movementCount = packed.ticks.byteLength / 4;
  const stateCount = packed.state_ticks.byteLength / 4;
  const sampledTicks: number[] = [];
  const sampledX: number[] = [];
  const sampledY: number[] = [];
  const sampledZ: number[] = [];
  let sampledSide: TeamNumber | null = null;
  let stateIndex = -1; // Index of the state applying to the current position
  let lastSampleIndex = -1;

  for (let index = 0; index < movementCount; index++) {
    const offset = index * 4;
    const tick = ticks.getInt32(offset);
    while (stateIndex + 1 < stateCount && stateTicks.getInt32((stateIndex + 1) * 4) <= tick) {
      stateIndex++;
    }
    if (stateIndex < 0 || tick < startTick) {
      continue;
    }

    const sampleIndex = Math.floor(tick / sampleInterval);
    if (sampleIndex === lastSampleIndex || packed.is_alive[stateIndex] !== 1) {
      continue;
    }

    sampledSide ??= side.getInt32(stateIndex * 4) as TeamNumber;
    sampledTicks.push(tick);
    sampledX.push(x.getFloat32(offset));
    sampledY.push(y.getFloat32(offset));
    sampledZ.push(z.getFloat32(offset));
    lastSampleIndex = sampleIndex;
  }

  if (sampledSide === null) {
    return null;
  }

  return {
    side: sampledSide,
    ticks: packInt32(sampledTicks),
    x: packFloat32(sampledX),
    y: packFloat32(sampledY),
    z: packFloat32(sampledZ),
  };
}
