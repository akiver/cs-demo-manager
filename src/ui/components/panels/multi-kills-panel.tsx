import React from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';

type Props = {
  oneKillCount: number;
  twoKillCount: number;
  threeKillCount: number;
  fourKillCount: number;
  fiveKillCount: number;
};

export function MultiKillsPanel({ oneKillCount, twoKillCount, threeKillCount, fourKillCount, fiveKillCount }: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Multi kills</Trans>
        </PanelTitle>
      }
    >
      <PanelRow>
        <p>
          <Trans context="Panel label">5K</Trans>
        </p>
        <PanelValue>{fiveKillCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">4K</Trans>
        </p>
        <PanelValue>{fourKillCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">3K</Trans>
        </p>
        <PanelValue>{threeKillCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">2K</Trans>
        </p>
        <PanelValue>{twoKillCount}</PanelValue>
      </PanelRow>
      <PanelRow>
        <p>
          <Trans context="Panel label">1K</Trans>
        </p>
        <PanelValue>{oneKillCount}</PanelValue>
      </PanelRow>
    </Panel>
  );
}
