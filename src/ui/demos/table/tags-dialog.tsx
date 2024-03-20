import React from 'react';
import { ChecksumsTagsDialog } from 'csdm/ui/dialogs/checksums-tags-dialog';
import type { Demo } from 'csdm/common/types/demo';

type Props = {
  demos: Demo[];
};

export function DemosTagsDialog({ demos }: Props) {
  const checksums: string[] = [];
  const tagIds: string[] = [];
  for (const demo of demos) {
    checksums.push(demo.checksum);
    tagIds.push(...demo.tagIds);
  }

  return <ChecksumsTagsDialog checksums={checksums} defaultTagIds={tagIds} />;
}
