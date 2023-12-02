import type { EconomyType, TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type PlayerEconomy = {
  id: ColumnID;
  matchChecksum: string;
  roundNumber: number;
  playerName: string;
  playerSteamId: string;
  playerSide: TeamNumber;
  startMoney: number;
  moneySpent: number;
  equipmentValue: number;
  type: EconomyType;
};
