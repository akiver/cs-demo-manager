import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';

type Props = {
  averageKillsPerRound: number;
};

export function AverageKillsPerRoundPanel({ averageKillsPerRound }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">Average kills/round</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(averageKillsPerRound, 2)}</PanelValue>
        </>
      }
    />
  );
}
