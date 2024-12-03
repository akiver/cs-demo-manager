import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  collateralKillCount: number;
  wallbangKillCount: number;
};

export function KillsPanel({ collateralKillCount, wallbangKillCount }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Kills</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Wallbang kills</Trans>
        </p>
        <PanelValue>{wallbangKillCount.toLocaleString()}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Collateral kills</Trans>
        </p>
        <PanelValue>{collateralKillCount.toLocaleString()}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
