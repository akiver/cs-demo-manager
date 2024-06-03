import type { Game } from 'csdm/common/types/counter-strike';

export type MapPayload = {
  id?: string;
  name: string;
  game: Game;
  posX: number;
  posY: number;
  thresholdZ: number;
  scale: number;
  // Use base64 data instead of images file path so we don't have to deal with possible inexistent files
  thumbnailBase64: string;
  radarBase64: string;
  lowerRadarBase64: string;
};
