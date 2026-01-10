import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  inspectionCount: number;
  deathWhileInspectingCount: number;
};

export function WeaponInspectionsPanel({ inspectionCount, deathWhileInspectingCount }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Weapon Inspections</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Total inspections</Trans>
        </p>
        <PanelValue>{inspectionCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Deaths while inspecting</Trans>
        </p>
        <PanelValue>{deathWhileInspectingCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
