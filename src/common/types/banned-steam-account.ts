import type { Rank } from 'csdm/common/types/counter-strike';

export type BannedSteamAccount = {
  steamId: string;
  name: string;
  avatar: string;
  lastBanDate: string;
  rank: Rank;
};
