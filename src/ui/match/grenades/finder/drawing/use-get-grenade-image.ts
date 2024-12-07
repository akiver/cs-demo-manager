import { useRef } from 'react';
import { GrenadeName } from 'csdm/common/types/counter-strike';
import { loadImageFromFilePath } from 'csdm/ui/shared/load-image-from-file-path';

async function getCachedImage(imageRef: React.RefObject<HTMLImageElement | null>, imageName: string) {
  if (imageRef.current !== null) {
    return imageRef.current;
  }

  imageRef.current = await loadImageFromFilePath(`${window.csdm.IMAGES_FOLDER_PATH}/grenades/${imageName}`);

  return imageRef.current;
}

export function useGetGrenadeImage() {
  const smokeImage = useRef<HTMLImageElement | null>(null);
  const flashbangImage = useRef<HTMLImageElement | null>(null);
  const heImage = useRef<HTMLImageElement | null>(null);
  const decoyImage = useRef<HTMLImageElement | null>(null);
  const molotovImage = useRef<HTMLImageElement | null>(null);
  const unknownImage = useRef<HTMLImageElement | null>(null);

  return async (grenadeName: GrenadeName) => {
    switch (grenadeName) {
      case GrenadeName.Smoke:
        return await getCachedImage(smokeImage, 'smoke-detonate.png');
      case GrenadeName.Flashbang:
        return await getCachedImage(flashbangImage, 'flashbang-detonate.png');
      case GrenadeName.HE:
        return await getCachedImage(heImage, 'he-detonate.png');
      case GrenadeName.Decoy:
        return await getCachedImage(decoyImage, 'decoy-detonate.png');
      case GrenadeName.Molotov:
      case GrenadeName.Incendiary:
        return await getCachedImage(molotovImage, 'molotov-detonate.png');
      default:
        return await getCachedImage(unknownImage, 'unknown-grenade.png');
    }
  };
}
