import type { Selectable } from 'kysely';

export type IgnoredSteamAccountTable = {
  steam_id: string;
};

export type IgnoredSteamAccountRow = Selectable<IgnoredSteamAccountTable>;
