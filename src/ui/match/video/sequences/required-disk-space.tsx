import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';

function MegaBytes({ mb }: { mb: number }) {
  const roundedMb = roundNumber(mb, 2);

  return <Trans context="Disk usage in megabyte">~{roundedMb}MB</Trans>;
}

function GigaBytes({ gb }: { gb: number }) {
  const roundedGb = roundNumber(gb, 2);

  return <Trans context="Disk usage in gigabyte">~{roundedGb}GB</Trans>;
}

type Props = {
  bytes: number;
};

export function RequiredDiskSpace({ bytes }: Props) {
  const minimumGigabyteWarning = 20;
  const mb = bytes / 1024 / 1024;
  const gb = mb / 1024;

  return (
    <span className={gb >= minimumGigabyteWarning ? 'text-red-600' : undefined}>
      {gb > 1 ? <GigaBytes gb={gb} /> : <MegaBytes mb={mb} />}
    </span>
  );
}
