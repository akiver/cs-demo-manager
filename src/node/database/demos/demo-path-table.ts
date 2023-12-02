import type { Selectable } from 'kysely';

export type DemoPathTable = {
  checksum: string;
  file_path: string;
};

export type DemoPathRow = Selectable<DemoPathTable>;
