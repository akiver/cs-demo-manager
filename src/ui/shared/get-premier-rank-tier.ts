import type { PremierRank } from 'csdm/common/types/counter-strike';

export function getPremierRankTier(rank: PremierRank) {
  const remappedRating = Math.floor(rank / 1000.0 / 5);
  const clampedRating = Math.max(0, Math.min(remappedRating, 6));

  return clampedRating;
}
