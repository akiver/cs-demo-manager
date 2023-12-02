import type { Perspective } from './perspective';

export type WatchPlayerOptions = {
  demoPath: string;
  steamId: string;
  perspective: Perspective;
  onGameStart: () => void;
};
