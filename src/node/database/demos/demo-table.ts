import type { Insertable, Selectable } from 'kysely';
import type { DemoSource, DemoType, Game } from 'csdm/common/types/counter-strike';

export type DemoTable = {
  checksum: string;
  name: string;
  game: Game;
  source: DemoSource;
  type: DemoType;
  date: Date;
  network_protocol: number;
  build_number: number; // CS2 only
  server_name: string;
  client_name: string;
  tick_count: number;
  tickrate: number;
  framerate: number;
  duration: number;
  map_name: string;
  share_code: string;
};

export type DemoRow = Selectable<DemoTable>;
export type InsertableDemoRow = Insertable<DemoTable>;
