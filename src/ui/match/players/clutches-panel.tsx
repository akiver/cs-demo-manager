import React, { type ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Panel, PanelTitle } from 'csdm/ui/components/panel';
import type { Clutch } from 'csdm/common/types/clutch';
import { PlayDemoAtTickButton } from '../rounds/play-demo-at-tick-button';
import { useBooleanHuman } from 'csdm/ui/hooks/use-boolean-to-human';
import type { Game } from 'csdm/common/types/counter-strike';

function Value({ children }: { children: ReactNode }) {
  return <span className="text-right selectable">{children}</span>;
}

type Props = {
  clutches: Clutch[];
  playerSteamId: string;
  demoPath: string;
  game: Game;
  tickrate: number;
};

export function ClutchesPanel({ clutches, playerSteamId, demoPath, game, tickrate }: Props) {
  const playerClutches = clutches.filter((clutch) => {
    return clutch.clutcherSteamId === playerSteamId;
  });
  const booleanToHuman = useBooleanHuman();

  return (
    <Panel
      header={
        <PanelTitle>
          <Trans context="Panel title">Clutches</Trans>
        </PanelTitle>
      }
      fitHeight={true}
    >
      <div className="grid grid-cols-6 gap-8 text-gray-900">
        <p>
          <Trans context="Panel label">Round</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Opponents</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Won</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Survived</Trans>
        </p>
        <p className="text-right">
          <Trans context="Panel label">Kills</Trans>
        </p>
      </div>

      <div className="flex flex-col">
        {playerClutches.map((clutch) => {
          return (
            <div className="grid grid-cols-6 gap-8" key={clutch.id}>
              <span className="selectable">{clutch.roundNumber}</span>
              <Value>{clutch.opponentCount}</Value>
              <Value>{booleanToHuman(clutch.won)}</Value>
              <Value>{booleanToHuman(clutch.hasClutcherSurvived)}</Value>
              <Value>{clutch.clutcherKillCount}</Value>
              <div className="ml-auto">
                <PlayDemoAtTickButton
                  demoPath={demoPath}
                  game={game}
                  tick={clutch.tick - 5 * tickrate}
                  tooltip={<Trans context="Tooltip">Watch clutch</Trans>}
                  focusSteamId={playerSteamId}
                  size={20}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
