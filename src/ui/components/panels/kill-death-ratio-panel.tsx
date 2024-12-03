import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';
import { roundNumber } from 'csdm/common/math/round-number';

type Props = {
  killDeathRatio: number;
};

export function KillDeathRatioPanel({ killDeathRatio }: Props) {
  return (
    <Panel
      fitHeight={true}
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">Kills/Deaths</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{roundNumber(killDeathRatio, 2)}</PanelValue>
        </>
      }
    />
  );
}
