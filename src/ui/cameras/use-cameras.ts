import type { Game } from 'csdm/common/types/counter-strike';
import { useCamerasState } from './use-cameras-state';

export function useCameras(game: Game, mapName: string) {
  const state = useCamerasState();

  return state.entities.filter((camera) => camera.game === game && camera.mapName === mapName);
}
