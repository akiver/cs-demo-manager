import React from 'react';
import { Trans } from '@lingui/react/macro';
import { StatLabel } from 'csdm/ui/match/grenades/stats/labels/label';

export function FlashbangLabels() {
  return (
    <>
      <StatLabel text={<Trans>Duration</Trans>} />
      <StatLabel text={<Trans>Players flashed</Trans>} />
      <StatLabel text={<Trans>Player flashed per throw</Trans>} />
      <StatLabel text={<Trans>Average player flashed per round</Trans>} />
    </>
  );
}
