import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Link } from './link';
import { buildMatchRoundPath } from 'csdm/ui/routes-paths';

type Props = {
  checksum: string;
  roundNumber: number;
};

export function SeeRoundLink({ checksum, roundNumber }: Props) {
  return (
    <Link to={buildMatchRoundPath(checksum, roundNumber)}>
      <Trans context="Link">See round</Trans>
    </Link>
  );
}
