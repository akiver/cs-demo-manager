import type { Generated, Selectable } from 'kysely';
import type { HostageState } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type HostagePositionTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  state: HostageState;
  x: number;
  y: number;
  z: number;
};

export type HostagePositionRow = Selectable<HostagePositionTable>;
