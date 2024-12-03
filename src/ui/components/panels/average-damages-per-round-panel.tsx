import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';

type Props = {
  averageDamagePerRound: number;
};

export function AverageDamagesPerRoundPanel({ averageDamagePerRound }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">ADR</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(averageDamagePerRound, 1)}</PanelValue>
        </>
      }
    />
  );
}
