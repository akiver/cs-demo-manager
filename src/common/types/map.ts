import type { Game } from 'csdm/common/types/counter-strike';

export type Map = {
  id: string;
  name: string;
  game: Game;
  posX: number;
  posY: number;
  scale: number;
  radarFilePath: string | undefined;
  lowerRadarFilePath: string | undefined;
  thumbnailFilePath: string | undefined;
};
