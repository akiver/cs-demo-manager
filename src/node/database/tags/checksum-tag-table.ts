import type { Selectable } from 'kysely';
import type { ColumnID } from 'csdm/common/types/column-id';

export type ChecksumTagTable = {
  checksum: string;
  tag_id: ColumnID;
};

export type ChecksumTagRow = Selectable<ChecksumTagTable>;
