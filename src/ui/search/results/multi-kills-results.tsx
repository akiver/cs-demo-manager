import React from 'react';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { CollapsePanel } from 'csdm/ui/components/collapse-panel/collapse-panel';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import type { MultiKillResult } from 'csdm/common/types/search/multi-kill-result';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import {
  ActionDuration,
  MapImage,
  MatchDate,
  PlayerName,
  RoundNumber,
  RowLeft,
  RowRight,
  TeamSideIcon,
} from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';

type Props = {
  multiKills: MultiKillResult[];
};

export function MultiKillsResults({ multiKills }: Props) {
  return (
    <VirtualListResults
      items={multiKills}
      renderItem={(multiKill) => {
        const [firstKill] = multiKill.kills;
        const lastKill = multiKill.kills[multiKill.kills.length - 1];
        return (
          <CollapsePanel
            key={multiKill.id}
            header={
              <div className="flex items-center flex-1 gap-x-8 justify-between overflow-x-auto">
                <RowLeft>
                  <MapImage mapName={multiKill.mapName} />
                  <TeamSideIcon side={multiKill.side} />
                  <PlayerName name={multiKill.killerName} />
                  <DotSeparator />
                  <p>{multiKill.mapName}</p>
                  <DotSeparator />
                  <RoundNumber roundNumber={multiKill.roundNumber} />
                  <DotSeparator />
                  <MatchDate date={multiKill.date} />
                  <DotSeparator />
                  <ActionDuration
                    startTick={firstKill?.tick ?? 0}
                    endTick={lastKill?.tick ?? 0}
                    tickrate={multiKill.matchTickrate}
                  />
                </RowLeft>
                <RowRight>
                  <WatchButton
                    demoPath={multiKill.demoPath}
                    tick={multiKill.tick - multiKill.matchTickrate * 5}
                    focusSteamId={multiKill.killerSteamId}
                    game={multiKill.game}
                  />
                  <SeeRoundLink checksum={multiKill.matchChecksum} roundNumber={multiKill.roundNumber} />
                  <SeeMatchButton checksum={multiKill.matchChecksum} />
                </RowRight>
              </div>
            }
          >
            {multiKill.kills.map((kill) => {
              return <KillFeedEntry key={kill.id} kill={kill} />;
            })}
          </CollapsePanel>
        );
      }}
    />
  );
}
