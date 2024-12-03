import React from 'react';
import { Trans } from '@lingui/react/macro';
import { StatLabel } from 'csdm/ui/match/grenades/stats/labels/label';

export function FireLabels() {
  return (
    <>
      <StatLabel text={<Trans>Damage</Trans>} />
      <StatLabel text={<Trans>Damage per throw</Trans>} />
      <StatLabel text={<Trans>Enemies damaged per throw</Trans>} />
      <StatLabel text={<Trans>Average damage per round</Trans>} />
    </>
  );
}
