import React from 'react';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { MapImage, MatchDate, RoundNumber, Row, RowLeft, RowRight } from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';
import type { RoundResult } from 'csdm/common/types/search/round-result';
import { Tags } from 'csdm/ui/components/tags/tags';

type Props = {
  rounds: RoundResult[];
};

export function RoundsResult({ rounds }: Props) {
  return (
    <VirtualListResults
      items={rounds}
      renderItem={(round) => {
        return (
          <Row key={round.id}>
            <RowLeft>
              <MapImage mapName={round.mapName} />
              <DotSeparator />
              <p>{round.mapName}</p>
              <DotSeparator />
              <RoundNumber roundNumber={round.number} />
              <DotSeparator />
              <MatchDate date={round.date} />
              {round.tagIds.length > 0 && (
                <>
                  <DotSeparator />
                  <Tags tagIds={round.tagIds} />
                </>
              )}
            </RowLeft>
            <RowRight>
              <WatchButton demoPath={round.demoPath} tick={round.startTick - 64 * 5} game={round.game} />
              <SeeRoundLink checksum={round.matchChecksum} roundNumber={round.number} />
              <SeeMatchButton checksum={round.matchChecksum} />
            </RowRight>
          </Row>
        );
      }}
    />
  );
}
