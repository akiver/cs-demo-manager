import React from 'react';
import { TagsDialog } from 'csdm/ui/dialogs/tags-dialog';
import type { MatchTable } from 'csdm/common/types/match-table';

type Props = {
  matches: MatchTable[];
};

export function MatchesTagsDialog({ matches }: Props) {
  const checksums: string[] = [];
  const tagIds: string[] = [];
  for (const match of matches) {
    checksums.push(match.checksum);
    tagIds.push(...match.tagIds);
  }

  return <TagsDialog checksums={checksums} defaultTagIds={tagIds} />;
}
