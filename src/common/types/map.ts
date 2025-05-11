import type { Game } from 'csdm/common/types/counter-strike';

export type Map = {
  id: string;
  name: string;
  game: Game;
  posX: number;
  posY: number;
  thresholdZ: number;
  scale: number;
  radarSize: number; // Since the May 9, 2025 CS2 update some maps have a 2048px radar size instead of 1024px
  radarFilePath: string | undefined;
  lowerRadarFilePath: string | undefined;
  thumbnailFilePath: string | undefined;
};
