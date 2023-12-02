import type { ColumnID } from 'csdm/common/types/column-id';

export type BaseEvent = {
  id: ColumnID;
  matchChecksum: string;
  tick: number;
  frame: number;
  roundNumber: number;
};
