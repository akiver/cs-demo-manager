import type { PlayerPosition } from 'csdm/common/types/player-position';

function hasSameState(a: PlayerPosition, b: PlayerPosition) {
  return (
    a.isAlive === b.isAlive &&
    a.side === b.side &&
    a.health === b.health &&
    a.armor === b.armor &&
    a.money === b.money &&
    a.hasHelmet === b.hasHelmet &&
    a.hasBomb === b.hasBomb &&
    a.hasDefuseKit === b.hasDefuseKit &&
    a.isDucking === b.isDucking &&
    a.isScoping === b.isScoping &&
    a.isDefusing === b.isDefusing &&
    a.isPlanting === b.isPlanting &&
    a.isGrabbingHostage === b.isGrabbingHostage &&
    a.activeWeaponName === b.activeWeaponName &&
    a.equipments === b.equipments &&
    a.grenades === b.grenades &&
    a.pistols === b.pistols &&
    a.smgs === b.smgs &&
    a.rifles === b.rifles &&
    a.heavy === b.heavy
  );
}

// Returns true when something that can't be interpolated happens between the two consecutive positions of a player.
function isDiscontinuity(previous: PlayerPosition, next: PlayerPosition) {
  // The flash duration decreases linearly unless the player is flashed again
  return !hasSameState(previous, next) || next.flashDurationRemaining > previous.flashDurationRemaining;
}

// Reduces the amount of positions sent to the 2D viewer by keeping only a few positions per second for each player.
// A position is kept when it's the first one of its sample interval, or when it's right before or right after a
// discontinuity so that discrete values (health, weapons...) remain accurate.
// Positions must be sorted by tick, the order is preserved.
export function samplePlayersPositions(positions: PlayerPosition[], tickrate: number): PlayerPosition[] {
  // Number of positions per second kept for each player, the 2D viewer interpolates positions between samples.
  const samplesPerSecond = 16;
  const sampleInterval = Math.max(1, Math.round(tickrate / samplesPerSecond));
  if (sampleInterval === 1) {
    return positions;
  }

  const shouldKeep = new Uint8Array(positions.length);
  const lastIndexPerPlayer = new Map<string, number>();
  for (let index = 0; index < positions.length; index++) {
    const position = positions[index];
    const previousIndex = lastIndexPerPlayer.get(position.playerSteamId);
    lastIndexPerPlayer.set(position.playerSteamId, index);
    if (previousIndex === undefined) {
      shouldKeep[index] = 1;
      continue;
    }

    const previous = positions[previousIndex];
    if (Math.floor(position.tick / sampleInterval) !== Math.floor(previous.tick / sampleInterval)) {
      shouldKeep[index] = 1;
    }

    if (isDiscontinuity(previous, position)) {
      shouldKeep[previousIndex] = 1;
      shouldKeep[index] = 1;
    }
  }

  // Last position of each player
  for (const index of lastIndexPerPlayer.values()) {
    shouldKeep[index] = 1;
  }

  return positions.filter((_, index) => shouldKeep[index] === 1);
}
