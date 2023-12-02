import { Trans } from '@lingui/macro';
import { Tags } from 'csdm/ui/components/tags';
import React from 'react';

type Props = {
  checksum: string;
  tagIds: string[];
};

export function DemoTags({ checksum, tagIds }: Props) {
  return (
    <div className="flex flex-col gap-y-8">
      <p>
        <Trans>Tags:</Trans>
      </p>
      <Tags checksum={checksum} tagIds={tagIds} />
    </div>
  );
}
