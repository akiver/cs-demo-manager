import type { Tag } from '../../../common/types/tag';
import type { TagRow } from './tag-table';

export function tagRowToTag(row: TagRow): Tag {
  return {
    id: String(row.id),
    name: row.name,
    color: row.color,
  };
}
