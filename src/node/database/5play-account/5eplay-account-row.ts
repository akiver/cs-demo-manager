import type { Selectable } from 'kysely';

export type FiveEPlayAccountTable = {
  id: string;
  domain_id: string;
  nickname: string;
  avatar_url: string;
  is_current: boolean;
};

export type FiveEPlayAccountRow = Selectable<FiveEPlayAccountTable>;
