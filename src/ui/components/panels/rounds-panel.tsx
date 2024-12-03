import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  roundCount: number;
  roundCountAsCt: number;
  roundCountAsT: number;
};

export function RoundsPanel({ roundCount, roundCountAsCt, roundCountAsT }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Rounds</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Total</Trans>
        </p>
        <PanelValue>{roundCount.toLocaleString()}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">CT</Trans>
        </p>
        <PanelValue>{roundCountAsCt.toLocaleString()}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">T</Trans>
        </p>
        <PanelValue>{roundCountAsT.toLocaleString()}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
