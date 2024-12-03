import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Tags } from 'csdm/ui/components/tags/tags';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { ChecksumsTagsDialog } from 'csdm/ui/dialogs/checksums-tags-dialog';

type Props = {
  checksum: string;
  tagIds: string[];
};

export function DemoTags({ checksum, tagIds }: Props) {
  const { showDialog } = useDialog();

  const onEditClick = () => {
    showDialog(<ChecksumsTagsDialog checksums={[checksum]} defaultTagIds={tagIds} />);
  };

  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans>Tags:</Trans>
      </p>
      <Tags tagIds={tagIds} onEditClick={onEditClick} />
    </div>
  );
}
