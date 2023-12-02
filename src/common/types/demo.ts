import type { ValveMatch } from './valve-match';
import type { DemoSource, DemoType, Game } from 'csdm/common/types/counter-strike';

export type Demo = {
  checksum: string;
  game: Game;
  filePath: string;
  name: string;
  source: DemoSource;
  type: DemoType;
  date: string;
  networkProtocol: number;
  buildNumber: number; // CS2 only
  serverName: string;
  clientName: string;
  tickCount: number;
  tickrate: number;
  frameRate: number;
  duration: number;
  mapName: string;
  comment: string;
  shareCode: string;
  tagIds: string[];
  valveMatch?: ValveMatch;
};
