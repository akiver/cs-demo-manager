import type { ColumnID } from 'csdm/common/types/column-id';

export type ChickenDeath = {
  id: ColumnID;
  matchChecksum: string;
  tick: number;
  frame: number;
  roundNumber: number;
  weaponName: string;
  killerSteamId: string;
};
