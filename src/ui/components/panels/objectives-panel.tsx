import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  bombDefusedCount: number;
  bombPlantedCount: number;
  hostageRescuedCount: number;
};

export function ObjectivesPanel({ bombDefusedCount, bombPlantedCount, hostageRescuedCount }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Objectives</Trans>
        </PanelTitle>
      }
      minWidth={200}
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Bomb planted</Trans>
        </p>
        <PanelValue>{bombPlantedCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Bomb defused</Trans>
        </p>
        <PanelValue>{bombDefusedCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Hostage rescued</Trans>
        </p>
        <PanelValue>{hostageRescuedCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
