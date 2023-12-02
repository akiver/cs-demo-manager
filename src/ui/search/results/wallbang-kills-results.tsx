import React from 'react';
import { WatchButton } from '../../components/buttons/watch-button';
import type { WallbangKillResult } from 'csdm/common/types/search/wallbang-kill-result';
import { KillFeedEntry } from '../../components/kill-feed-entry';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { MapImage, MatchDate, RoundNumber, Row, RowLeft, RowRight } from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';

type Props = {
  kills: WallbangKillResult[];
};

export function WallbangKillsResults({ kills }: Props) {
  return (
    <VirtualListResults
      items={kills}
      renderItem={(kill) => {
        return (
          <Row key={kill.id}>
            <RowLeft>
              <MapImage mapName={kill.mapName} />
              <div>
                <KillFeedEntry kill={kill} />
              </div>
              <DotSeparator />
              <p>{kill.mapName}</p>
              <DotSeparator />
              <RoundNumber roundNumber={kill.roundNumber} />
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
              <SeeMatchButton checksum={kill.matchChecksum} />
            </RowRight>
          </Row>
        );
      }}
    />
  );
}
