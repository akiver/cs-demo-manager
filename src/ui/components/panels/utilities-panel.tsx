import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  heGrenadeThrownCount: number;
  molotovThrownCount: number;
  incendiaryThrownCount: number;
  decoyThrownCount: number;
  smokeThrownCount: number;
  flashbangThrownCount: number;
};

export function UtilitiesPanel({
  decoyThrownCount,
  flashbangThrownCount,
  heGrenadeThrownCount,
  incendiaryThrownCount,
  molotovThrownCount,
  smokeThrownCount,
}: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Utilities</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">HE grenades</Trans>
        </p>
        <PanelValue>{heGrenadeThrownCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Flashbangs</Trans>
        </p>
        <PanelValue>{flashbangThrownCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Smokes</Trans>
        </p>
        <PanelValue>{smokeThrownCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Molotovs</Trans>
        </p>
        <PanelValue>{molotovThrownCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Incendiaries</Trans>
        </p>
        <PanelValue>{incendiaryThrownCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Decoys</Trans>
        </p>
        <PanelValue>{decoyThrownCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
