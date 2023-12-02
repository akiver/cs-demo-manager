import type { Generated, Selectable } from 'kysely';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type ChatMessageTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  message: string;
  sender_is_alive: boolean;
  sender_name: string;
  sender_steam_id: string;
  sender_side: TeamNumber;
};

export type ChatMessageRow = Selectable<ChatMessageTable>;
