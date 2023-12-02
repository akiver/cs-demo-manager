import type { BannedSteamAccount } from './banned-steam-account';

export type BanStats = {
  accountCount: number;
  bannedAccountCount: number;
  bannedAccountPercentage: number;
  bannedAccounts: BannedSteamAccount[];
  averageBannedAccountPerMatch: number;
  averageBannedAccountAgeInMonths: string | null;
  medianBannedAccountAgeInMonths: string | null;
};
