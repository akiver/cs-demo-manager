import React from 'react';
import { Trans } from '@lingui/react/macro';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import type { Kill } from 'csdm/common/types/kill';
import { PlayDemoAtTickButton } from 'csdm/ui/match/rounds/play-demo-at-tick-button';
import { Panel } from 'csdm/ui/components/panel';
import type { Round } from 'csdm/common/types/round';
import { useCurrentMatch } from '../use-current-match';

type Props = {
  header: string;
  kills: Kill[];
  rounds: Round[];
  demoPath: string;
  tickrate: number;
};

export function KillsPanel({ header, kills, demoPath, tickrate, rounds }: Props) {
  const match = useCurrentMatch();
  const sortedKills = [...kills].sort((killA, killB) => killA.tick - killB.tick);

  return (
    <Panel header={header} fitHeight={true}>
      <div className="flex flex-col gap-y-4">
        {sortedKills.map((kill, index) => {
          const { tick, victimName, killerSteamId, roundNumber } = kill;
          const round = rounds.find((round) => round.number === roundNumber);
          const previousRoundNumber = index > 0 ? sortedKills[index - 1].roundNumber : 0;

          return (
            <div key={`kill-${tick}-${victimName}`}>
              {roundNumber !== previousRoundNumber && (
                <p className="text-gray-900">
                  <Trans>Round {roundNumber}</Trans>
                </p>
              )}
              <KillFeedEntry
                kill={kill}
                timeElapsedOption={{
                  tickrate: match.tickrate,
                  roundFreezetimeEndTick: round?.freezetimeEndTick ?? 1,
                }}
                right={
                  <PlayDemoAtTickButton
                    demoPath={demoPath}
                    game={match.game}
                    tick={tick - tickrate * 5}
                    size={20}
                    focusSteamId={killerSteamId === null ? undefined : killerSteamId}
                    tooltip={<Trans context="Tooltip">Watch kill</Trans>}
                  />
                }
              />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
