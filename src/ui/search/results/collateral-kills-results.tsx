import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { KillFeedEntry } from 'csdm/ui/components/kill-feed-entry';
import type { CollateralKillResult } from 'csdm/common/types/search/collateral-kill-result';
import { CollapsePanel } from 'csdm/ui/components/collapse-panel/collapse-panel';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { MapImage, MatchDate, PlayerName, RoundNumber, RowLeft, RowRight, TeamSideIcon } from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';

type Props = {
  kills: CollateralKillResult[];
};

export function CollateralKillsResults({ kills }: Props) {
  return (
    <VirtualListResults
      items={kills}
      renderItem={(kill) => {
        const deathCount = kill.kills.length;
        return (
          <CollapsePanel
            key={kill.id}
            header={
              <div className="flex items-center flex-1 gap-x-8 justify-between overflow-x-auto">
                <RowLeft>
                  <MapImage mapName={kill.mapName} />
                  <TeamSideIcon side={kill.side} />
                  <PlayerName name={kill.killerName} />
                  <DotSeparator />
                  <p>{kill.mapName}</p>
                  <DotSeparator />
                  <RoundNumber roundNumber={kill.roundNumber} />
                  <DotSeparator />
                  <p>
                    <Trans>Deaths {deathCount}</Trans>
                  </p>
                  <DotSeparator />
                  <MatchDate date={kill.date} />
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
            {kill.kills.map((kill) => {
              return <KillFeedEntry key={kill.id} kill={kill} />;
            })}
          </CollapsePanel>
        );
      }}
    />
  );
}
