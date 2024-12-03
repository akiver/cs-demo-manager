import React from 'react';
import { Trans } from '@lingui/react/macro';

type Props = {
  requiredDiskSpace: number;
};
export function RequiredDiskSpace({ requiredDiskSpace }: Props) {
  const minimumGigabyteWarning = 20;

  return (
    <span className={requiredDiskSpace >= minimumGigabyteWarning ? 'text-red-600' : undefined}>
      <Trans context="Disk usage in gigabyte">~{requiredDiskSpace}GB</Trans>
    </span>
  );
}
