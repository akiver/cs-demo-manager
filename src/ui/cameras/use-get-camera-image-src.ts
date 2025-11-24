import { useCamerasState } from './use-cameras-state';

export function useGetCameraImageSrc() {
  const { entities: cameras, cacheTimestamp } = useCamerasState();

  return (id: string) => {
    const camera = cameras.find((camera) => camera.id === id);
    const imageFilePath = camera?.imagePath ?? window.csdm.unknownImageFilePath;

    return `file://${imageFilePath}?timestamp=${cacheTimestamp}`;
  };
}
