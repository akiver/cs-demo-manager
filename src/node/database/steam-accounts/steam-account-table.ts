import type { ColumnType, Insertable, Updateable } from 'kysely';
import type { EconomyBan } from 'csdm/node/steam-web-api/steam-constants';

export type SteamAccountTable = {
  steam_id: string;
  is_community_banned: boolean;
  has_private_profile: boolean;
  vac_ban_count: number;
  last_ban_date: Date | null;
  game_ban_count: number;
  economy_ban: EconomyBan;
  avatar: string;
  name: string;
  creation_date: Date | null;
  created_at: ColumnType<Date, never, never>;
  updated_at: ColumnType<Date, never, never>;
};

export type InsertableSteamAccount = Insertable<SteamAccountTable>;
export type UpdateableSteamAccount = Updateable<SteamAccountTable>;
