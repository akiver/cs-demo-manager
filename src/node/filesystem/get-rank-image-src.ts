import path from 'node:path';
import { type Rank } from 'csdm/common/types/counter-strike';
import { getImagesFolderPath } from 'csdm/node/filesystem/get-images-folder-path';

export function getRankImageSrc(rank: Rank) {
  const imagesFolderPath = getImagesFolderPath();
  const imageSrc = path.join(imagesFolderPath, 'ranks', 'competitive', `${rank}.png`);

  return `file://${imageSrc}`;
}
