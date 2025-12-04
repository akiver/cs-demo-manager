import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import { CollapsePanel } from 'csdm/ui/components/collapse-panel/collapse-panel';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { MapImage, MatchDate, PlayerName, RoundNumber, RowLeft, RowRight, TeamSideIcon } from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';
import { RoundCommentIcon } from 'csdm/ui/match/rounds/round/round-comment-icon';
import { Markdown } from 'csdm/ui/components/markdown';
import type { KillResult } from 'csdm/common/types/search/kill-result';

type Props = {
  kills: KillResult[];
};

export function KillsResults({ kills }: Props) {
  return (
    <VirtualListResults
      items={kills}
      renderItem={(kill) => {
        const deathCount = kill.kills.length;
        const isSingleKill = deathCount === 1;
        return (
          <CollapsePanel
            key={kill.id}
            isEnabled={!isSingleKill}
            header={
              <div className="flex flex-1 items-center justify-between gap-x-8 overflow-x-auto">
                <RowLeft>
                  <MapImage mapName={kill.mapName} />
                  {isSingleKill ? (
                    <div>
                      <KillFeedEntry kill={kill.kills[0]} />
                    </div>
                  ) : (
                    <>
                      <TeamSideIcon side={kill.side} />
                      <PlayerName name={kill.killerName} />
                    </>
                  )}
                  <DotSeparator />
                  <p>{kill.mapName}</p>
                  <DotSeparator />
                  <RoundNumber roundNumber={kill.roundNumber} />
                  <DotSeparator />

                  {kill.kills.length > 1 && (
                    <>
                      <p>
                        <Trans>Deaths {deathCount}</Trans>
                      </p>
                      <DotSeparator />
                    </>
                  )}

                  <MatchDate date={kill.date} />
                  {kill.roundComment && (
                    <>
                      <DotSeparator />
                      <RoundCommentIcon comment={kill.roundComment} />
                    </>
                  )}
                </RowLeft>
                <RowRight>
                  <WatchButton
                    demoPath={kill.demoPath}
                    tick={kill.tick - 64 * 5}
                    focusSteamId={kill.killerSteamId}
                    game={kill.game}
                  />
                  <SeeRoundLink checksum={kill.matchChecksum} roundNumber={kill.roundNumber} />
                  <SeeMatchButton checksum={kill.matchChecksum} />
                </RowRight>
              </div>
            }
          >
            {kill.kills.length > 1 && (
              <div className="flex gap-x-10 overflow-hidden">
                <div className="flex flex-col">
                  {kill.kills.map((kill) => {
                    return <KillFeedEntry key={kill.id} kill={kill} />;
                  })}
                </div>
                {kill.roundComment && (
                  <div className="max-h-[160px] w-full overflow-auto">
                    <Markdown markdown={kill.roundComment} />
                  </div>
                )}
              </div>
            )}
          </CollapsePanel>
        );
      }}
    />
  );
}
