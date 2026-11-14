import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { StatLabel } from 'csdm/ui/match/grenades/stats/labels/label';
import { Tooltip } from 'csdm/ui/components/tooltip';

export function GrenadeBuyLabels() {
  const match = useCurrentMatch();
  if (match.grenadeBuys.length === 0) {
    return null;
  }

  return (
    <>
      <StatLabel text={<Trans>Bought</Trans>} />
      <StatLabel
        text={
          <Tooltip
            content={<Trans>Percentage of bought grenades that have been thrown</Trans>}
            placement="top"
            renderInPortal={true}
          >
            <span>
              <Trans context="Grenades usage">Usage</Trans>
            </span>
          </Tooltip>
        }
      />
    </>
  );
}
