import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerPosition } from 'csdm/common/types/player-position';
import type { PlayerTimeline } from 'csdm/common/types/player-timeline';
import { findLastIndexAtOrBeforeTick } from 'csdm/common/array/find-last-index-at-or-before-tick';

export function findLastPositionAtOrBeforeTick(positions: PlayerPosition[], tick: number): PlayerPosition | undefined {
  return positions[findLastIndexAtOrBeforeTick(positions, tick)];
}

function interpolate(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function interpolateAngle(from: number, to: number, ratio: number) {
  const delta = ((((to - from) % 360) + 540) % 360) - 180;

  return from + delta * ratio;
}

// Movements are sampled server-side, they are interpolated between samples.
// When two samples are too far apart, the previous sample is used without interpolation.
function getMovementAtTick(
  movements: PlayerMovement[],
  tick: number,
  maxInterpolationTickCount: number,
): PlayerMovement | undefined {
  const index = findLastIndexAtOrBeforeTick(movements, tick);
  if (index === -1) {
    return undefined;
  }

  const previous = movements[index];
  if (previous.tick === tick) {
    return previous;
  }

  const next: PlayerMovement | undefined = movements[index + 1];
  // The player's movements ended before this tick
  if (next === undefined) {
    return undefined;
  }

  const tickCount = next.tick - previous.tick;
  if (tickCount > maxInterpolationTickCount) {
    return { ...previous, tick };
  }

  const ratio = (tick - previous.tick) / tickCount;

  return {
    ...previous,
    tick,
    x: interpolate(previous.x, next.x, ratio),
    y: interpolate(previous.y, next.y, ratio),
    z: interpolate(previous.z, next.z, ratio),
    yaw: interpolateAngle(previous.yaw, next.yaw, ratio),
    flashDurationRemaining: interpolate(previous.flashDurationRemaining, next.flashDurationRemaining, ratio),
  };
}

function getPlayerPositionAtTick(
  timeline: PlayerTimeline,
  tick: number,
  maxInterpolationTickCount: number,
): PlayerPosition | undefined {
  const movement = getMovementAtTick(timeline.movements, tick, maxInterpolationTickCount);
  const state = timeline.states[findLastIndexAtOrBeforeTick(timeline.states, tick)];
  if (movement === undefined || state === undefined) {
    return undefined;
  }

  return { ...state, ...movement };
}

export function getPlayersPositionsAtTick(
  timelines: PlayerTimeline[],
  tick: number,
  maxInterpolationTickCount: number,
): PlayerPosition[] {
  const positions: PlayerPosition[] = [];
  for (const timeline of timelines) {
    const position = getPlayerPositionAtTick(timeline, tick, maxInterpolationTickCount);
    if (position) {
      positions.push(position);
    }
  }

  return positions;
}

// Returns the positions of the players carrying the bomb sorted by tick.
// The sampled movements include the one right before each state change and the last one of each player, so the last
// carrier position before a tick is where the bomb has been dropped (by a player, on death or on disconnection).
export function findBombCarrierPositions(timelines: PlayerTimeline[]): PlayerPosition[] {
  const positions: PlayerPosition[] = [];
  for (const { movements, states } of timelines) {
    // Movements and states are both sorted by tick, walk them together.
    let stateIndex = -1;
    for (const movement of movements) {
      while (stateIndex + 1 < states.length && states[stateIndex + 1].tick <= movement.tick) {
        stateIndex++;
      }
      const state = states[stateIndex];
      if (state?.hasBomb) {
        positions.push({ ...state, ...movement });
      }
    }
  }

  return positions.sort((positionA, positionB) => positionA.tick - positionB.tick);
}
