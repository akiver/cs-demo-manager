import React, { type ReactElement, type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelRow, PanelTitle, PanelValue } from 'csdm/ui/components/panel';
import { Tooltip } from 'csdm/ui/components/tooltip';

type RowProps = {
  title: ReactNode;
  value: ReactNode;
  tooltip: ReactElement;
};

function Row({ title, value, tooltip }: RowProps) {
  return (
    <Tooltip content={<div className="max-w-[300px]">{tooltip}</div>}>
      <div>
        <PanelRow>
          <p>{title}</p>
          <PanelValue>{value}</PanelValue>
        </PanelRow>
      </div>
    </Tooltip>
  );
}

type Props = {
  averageBlindTime: number;
  averageEnemiesFlashed: number;
  averageHeGrenadeDamage: number;
  averageSmokesThrownPerMatch: number;
};

export function PlayerUtilitiesPanel({
  averageBlindTime,
  averageEnemiesFlashed,
  averageHeGrenadeDamage,
  averageSmokesThrownPerMatch,
}: Props) {
  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Utilities</Trans>
        </PanelTitle>
      }
    >
      <Row
        tooltip={<Trans>On average, how long enemies stay blind whilst affected by a player's flashbang.</Trans>}
        title={<Trans context="Panel label">Avg blind time</Trans>}
        value={<Trans context="Seconds">{averageBlindTime}s</Trans>}
      />
      <Row
        tooltip={
          <Trans>
            The average number of enemies blinded per flashbang thrown by the player. This includes only 5v5 matches, so
            the maximum possible value is 5.
          </Trans>
        }
        title={<Trans context="Panel label">Enemies flashed</Trans>}
        value={averageEnemiesFlashed}
      />
      <Row
        tooltip={<Trans>On average, how much damage is dealt to enemies with HE grenades thrown by the player.</Trans>}
        title={<Trans context="Panel label">Avg HE damages</Trans>}
        value={averageHeGrenadeDamage}
      />
      <Row
        tooltip={
          <Trans>
            On average, how many smokes are thrown by the player in a single match. This includes only 5v5 matches.
          </Trans>
        }
        title={<Trans context="Panel label">Avg smokes thrown</Trans>}
        value={averageSmokesThrownPerMatch}
      />
    </Panel>
  );
}
