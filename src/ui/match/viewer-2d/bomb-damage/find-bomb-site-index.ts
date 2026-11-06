import type { MapBombDamageSite } from 'csdm/common/types/map-bomb-damage';
import type { BombPlanted } from 'csdm/common/types/bomb-planted';

type Position = { x: number; y: number; z: number };

function getDistanceToSite({ min, max }: MapBombDamageSite, position: Position) {
  const deltaX = Math.max(min.x - position.x, 0, position.x - max.x);
  const deltaY = Math.max(min.y - position.y, 0, position.y - max.y);
  const deltaZ = Math.max(min.z - position.z, 0, position.z - max.z);

  return Math.hypot(deltaX, deltaY, deltaZ);
}

export function findBombSiteIndex(sites: MapBombDamageSite[], bomb: Pick<BombPlanted, 'site' | 'x' | 'y' | 'z'>) {
  const letter = bomb.site.trim().toUpperCase();
  const indexFromLetter = sites.findIndex((site) => site.letter === letter);
  if (indexFromLetter !== -1) {
    return indexFromLetter;
  }

  // Fallback to the closest site if no site matches the letter
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < sites.length; index++) {
    const distance = getDistanceToSite(sites[index], bomb);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  }

  return closestIndex;
}
