import React from 'react';
import { TagsDialog as CommonTagsDialog } from 'csdm/ui/dialogs/tags-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';

type Props = {
  matches: MatchTable[];
};

export function TagsDialog({ matches }: Props) {
  const checksums: string[] = [];
  const tagIds: string[] = [];
  for (const match of matches) {
    checksums.push(match.checksum);
    tagIds.push(...match.tagIds);
  }

  return <CommonTagsDialog checksums={checksums} defaultTagIds={tagIds} />;
}
