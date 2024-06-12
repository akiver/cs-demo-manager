import { createAction } from '@reduxjs/toolkit';
import type { Tag } from 'csdm/common/types/tag';

export const tagInserted = createAction<{ tag: Tag }>('tags/insertSuccess');
export const tagUpdated = createAction<{ tag: Tag }>('tags/updateSuccess');
export const tagDeleted = createAction<{ tagId: string }>('tags/deleteSuccess');
export const checksumsTagsUpdated = createAction<{ checksums: string[]; tagIds: string[] }>(
  'tags/checksumsTagsUpdated',
);
export const roundTagsUpdated = createAction<{ checksum: string; roundNumber: number; tagIds: string[] }>(
  'tags/roundTagsUpdated',
);
export const playersTagsUpdated = createAction<{ steamIds: string[]; tagIds: string[] }>('tags/playersTagsUpdated');
