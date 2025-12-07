import type { Selectable } from 'kysely';

export type RenownAccountTable = {
  steam_id: string;
  nickname: string;
  avatar_url: string;
  is_current: boolean;
};

export type RenownAccountRow = Selectable<RenownAccountTable>;
