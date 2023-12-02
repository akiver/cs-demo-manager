import path from 'node:path';
import { type PremierRank } from 'csdm/common/types/counter-strike';
import { getImagesFolderPath } from 'csdm/node/filesystem/get-images-folder-path';
import { getPremierRankTier } from 'csdm/ui/shared/get-premier-rank-tier';

export function getPremierRankImageSrc(rank: PremierRank) {
  const imagesFolderPath = getImagesFolderPath();
  const tier = getPremierRankTier(rank);
  const imageSrc = path.join(imagesFolderPath, 'ranks', 'premier', `tier-${tier}.png`);

  return `file://${imageSrc}`;
}
