import React from 'react';
import { Trans } from '@lingui/react/macro';
import { roundNumber } from 'csdm/common/math/round-number';
import { Panel, PanelRow, PanelTitle, PanelValue, PanelValueVariant } from 'csdm/ui/components/panel';

type Props = {
  headshotPercentage: number;
  headshotCount: number;
  killCount: number;
  deathCount: number;
  assistCount: number;
};

export function HeadshotPanel({ headshotPercentage, headshotCount, killCount, deathCount, assistCount }: Props) {
  return (
    <Panel
      header={
        <>
          <PanelTitle>
            <Trans context="Panel title">HS %</Trans>
          </PanelTitle>
          <PanelValue variant={PanelValueVariant.Big}>{`${roundNumber(headshotPercentage, 1)}%`}</PanelValue>
        </>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">Kills</Trans>
        </p>
        <PanelValue>{killCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Deaths</Trans>
        </p>
        <PanelValue>{deathCount.toLocaleString()}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Assists</Trans>
        </p>
        <PanelValue>{assistCount.toLocaleString()}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">Headshots</Trans>
        </p>
        <PanelValue>{headshotCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
