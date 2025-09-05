import type { BanFilter } from 'csdm/common/types/ban-filter';

export type PlayersTableFilter = {
  name?: string;
  bans: BanFilter[];
  startDate: string | undefined;
  endDate: string | undefined;
  tagIds: string[];
};
