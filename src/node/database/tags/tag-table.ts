import type { Generated, Insertable, Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type TagTable = {
  id: Generated<ColumnID>;
  name: string;
  color: string;
};

export type TagRow = Selectable<TagTable>;
export type InsertableTag = Insertable<TagTable>;
