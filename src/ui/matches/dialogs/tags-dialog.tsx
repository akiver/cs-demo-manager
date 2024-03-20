import React from 'react';
import { ChecksumsTagsDialog } from 'csdm/ui/dialogs/checksums-tags-dialog';
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

  return <ChecksumsTagsDialog checksums={checksums} defaultTagIds={tagIds} />;
}
