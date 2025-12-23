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
import { RoundCommentIcon } from 'csdm/ui/match/rounds/round/round-comment-icon';
import { Markdown } from 'csdm/ui/components/markdown';
import { lastArrayItem } from 'csdm/common/array/last-array-item';

type Props = {
  multiKills: MultiKillResult[];
};

export function MultiKillsResults({ multiKills }: Props) {
  return (
    <VirtualListResults
      items={multiKills}
      renderItem={(multiKill) => {
        if (multiKill.kills.length < 2) {
          return null;
        }
        const [firstKill] = multiKill.kills;
        const lastKill = lastArrayItem(multiKill.kills);
        return (
          <CollapsePanel
            key={multiKill.id}
            header={
              <div className="flex flex-1 items-center justify-between gap-x-8 overflow-x-auto">
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
                    startTick={firstKill.tick}
                    endTick={lastKill.tick}
                    tickrate={multiKill.matchTickrate}
                  />
                  {multiKill.roundComment && (
                    <>
                      <DotSeparator />
                      <RoundCommentIcon comment={multiKill.roundComment} />
                    </>
                  )}
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
            <div className="flex gap-x-10 overflow-hidden">
              <div className="flex flex-col">
                {multiKill.kills.map((kill) => {
                  return <KillFeedEntry key={kill.id} kill={kill} />;
                })}
              </div>
              {multiKill.roundComment && (
                <div className="max-h-[160px] w-full overflow-auto">
                  <Markdown markdown={multiKill.roundComment} />
                </div>
              )}
            </div>
          </CollapsePanel>
        );
      }}
    />
  );
}
