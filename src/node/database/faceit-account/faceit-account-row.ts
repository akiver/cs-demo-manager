import type { Selectable } from 'kysely';

export type FaceitAccountTable = {
  id: string;
  nickname: string;
  avatar_url: string;
  is_current: boolean;
};

export type FaceitAccountRow = Selectable<FaceitAccountTable>;
