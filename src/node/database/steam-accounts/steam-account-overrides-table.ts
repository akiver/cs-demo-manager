import type { Selectable } from 'kysely';

export type SteamAccountOverridesTable = {
  steam_id: string;
  name: string;
};

export type SteamAccountNameTableRow = Selectable<SteamAccountOverridesTable>;
