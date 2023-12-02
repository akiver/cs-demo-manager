import type { Generated, Selectable } from 'kysely';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import type { ColumnID } from 'csdm/common/types/column-id';

export type PlayerBlindTable = {
  id: Generated<ColumnID>;
  match_checksum: string;
  round_number: number;
  tick: number;
  frame: number;
  duration: number;
  flasher_steam_id: string;
  flasher_name: string;
  flasher_side: TeamNumber;
  is_flasher_controlling_bot: boolean;
  flashed_steam_id: string;
  flashed_name: string;
  flashed_side: TeamNumber;
  is_flashed_controlling_bot: boolean;
};

export type PlayerBlindRow = Selectable<PlayerBlindTable>;
