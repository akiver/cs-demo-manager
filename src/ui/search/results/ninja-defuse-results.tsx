import React from 'react';
import { Trans } from '@lingui/react/macro';
import { WatchButton } from 'csdm/ui/components/buttons/watch-button';
import type { NinjaDefuseResult } from 'csdm/common/types/search/ninja-defuse-result';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { MapImage, MatchDate, PlayerName, RoundNumber, Row, RowLeft, RowRight } from './result-row';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';

type Props = {
  bombsDefused: NinjaDefuseResult[];
};

export function NinjaDefuseResults({ bombsDefused }: Props) {
  return (
    <VirtualListResults
      items={bombsDefused}
      renderItem={(bombDefused) => {
        const ctAliveCount = bombDefused.ctAliveCount;
        const tAliveCount = bombDefused.tAliveCount;
        return (
          <Row key={bombDefused.id}>
            <RowLeft>
              <MapImage mapName={bombDefused.mapName} />
              <PlayerName name={bombDefused.defuserName} />
              <DotSeparator />
              <p>{bombDefused.mapName}</p>
              <DotSeparator />
              <RoundNumber roundNumber={bombDefused.roundNumber} />
              <DotSeparator />
              <p>
                <Trans>CT {ctAliveCount}</Trans>
              </p>
              <DotSeparator />
              <p>
                <Trans>T {tAliveCount}</Trans>
              </p>
              <DotSeparator />
              <MatchDate date={bombDefused.date} />
            </RowLeft>
            <RowRight>
              <WatchButton
                demoPath={bombDefused.demoPath}
                tick={bombDefused.tick - 64 * 20}
                focusSteamId={bombDefused.defuserSteamId}
                game={bombDefused.game}
              />
              <SeeRoundLink checksum={bombDefused.matchChecksum} roundNumber={bombDefused.roundNumber} />
              <SeeMatchButton checksum={bombDefused.matchChecksum} />
            </RowRight>
          </Row>
        );
      }}
    />
  );
}
