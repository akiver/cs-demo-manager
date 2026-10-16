import type { PlayerMovement } from 'csdm/common/types/player-movement';
import type { PlayerState } from 'csdm/common/types/player-state';

// Reduces the amount of movements of a player sent to the 2D viewer by keeping only a few movements per second.
// A movement is kept when it's the first one of its sample interval, or when it's right before or right after something
// that can't be interpolated (state change such as a death, new flash).
// Movements and states must be sorted by tick, the order is preserved.
export function samplePlayerMovements(
  movements: PlayerMovement[],
  states: PlayerState[],
  tickrate: number,
): PlayerMovement[] {
  // Number of movements per second kept, the 2D viewer interpolates movements between samples.
  const samplesPerSecond = 16;
  const sampleInterval = Math.max(1, Math.round(tickrate / samplesPerSecond));
  if (sampleInterval === 1 || movements.length === 0) {
    return movements;
  }

  const shouldKeep = new Uint8Array(movements.length);
  shouldKeep[0] = 1;
  shouldKeep[movements.length - 1] = 1;
  let stateIndex = 0;
  for (let index = 1; index < movements.length; index++) {
    const movement = movements[index];
    const previous = movements[index - 1];
    if (Math.floor(movement.tick / sampleInterval) !== Math.floor(previous.tick / sampleInterval)) {
      shouldKeep[index] = 1;
    }

    let hasStateChanged = false;
    while (stateIndex < states.length && states[stateIndex].tick <= movement.tick) {
      hasStateChanged = hasStateChanged || states[stateIndex].tick > previous.tick;
      stateIndex++;
    }

    // The flash duration decreases linearly unless the player is flashed again
    const isFlashed = movement.flashDurationRemaining > previous.flashDurationRemaining;
    if (hasStateChanged || isFlashed) {
      shouldKeep[index - 1] = 1;
      shouldKeep[index] = 1;
    }
  }

  return movements.filter((_, index) => shouldKeep[index] === 1);
}
