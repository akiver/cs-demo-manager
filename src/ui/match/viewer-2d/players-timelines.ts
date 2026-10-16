import type { PlayerPosition } from 'csdm/common/types/player-position';

// Positions of a player sorted by tick.
type PlayerTimeline = PlayerPosition[];

export function buildPlayersTimelines(positions: PlayerPosition[]): PlayerTimeline[] {
  // Positions are sorted by tick.
  const timelines = new Map<string, PlayerTimeline>();
  for (const position of positions) {
    const timeline = timelines.get(position.playerSteamId);
    if (timeline) {
      timeline.push(position);
    } else {
      timelines.set(position.playerSteamId, [position]);
    }
  }

  return [...timelines.values()];
}

// Returns the index of the last position with a tick lower than or equal to the given tick, -1 if there is none.
function findLastIndexAtOrBeforeTick(positions: PlayerPosition[], tick: number) {
  let low = 0;
  let high = positions.length - 1;
  let index = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (positions[middle].tick <= tick) {
      index = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return index;
}

export function findLastPositionBeforeTick(positions: PlayerPosition[], tick: number): PlayerPosition | undefined {
  return positions[findLastIndexAtOrBeforeTick(positions, tick - 1)];
}

function interpolate(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function interpolateAngle(from: number, to: number, ratio: number) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;

  return from + delta * ratio;
}

// Positions are sampled server-side, continuous values (coordinates, yaw, flash) are interpolated between samples.
// Discrete values are taken from the previous sample, they are accurate because samples surrounding a state change are
// always kept.
// When two samples are too far apart, the previous sample is used without interpolation.
export function getPlayersPositionsAtTick(
  timelines: PlayerTimeline[],
  tick: number,
  maxInterpolationTickCount: number,
): PlayerPosition[] {
  const positions: PlayerPosition[] = [];
  for (const timeline of timelines) {
    const index = findLastIndexAtOrBeforeTick(timeline, tick);
    if (index === -1) {
      continue;
    }

    const previous = timeline[index];
    if (previous.tick === tick) {
      positions.push(previous);
      continue;
    }

    const next: PlayerPosition | undefined = timeline[index + 1];
    // The player's positions ended before this tick
    if (next === undefined) {
      continue;
    }

    const tickCount = next.tick - previous.tick;
    if (tickCount > maxInterpolationTickCount) {
      positions.push({ ...previous, tick });
      continue;
    }

    const ratio = (tick - previous.tick) / tickCount;
    positions.push({
      ...previous,
      tick,
      x: interpolate(previous.x, next.x, ratio),
      y: interpolate(previous.y, next.y, ratio),
      z: interpolate(previous.z, next.z, ratio),
      yaw: interpolateAngle(previous.yaw, next.yaw, ratio),
      flashDurationRemaining: interpolate(previous.flashDurationRemaining, next.flashDurationRemaining, ratio),
    });
  }

  return positions;
}
