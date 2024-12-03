import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';

type Props = {
  averageDeathsPerRound: number;
};

export function AverageDeathsPerRoundPanel({ averageDeathsPerRound }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">Average deaths/round</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(averageDeathsPerRound, 2)}</PanelValue>
        </>
      }
    />
  );
}
