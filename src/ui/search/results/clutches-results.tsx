import React from 'react';
import { WatchButton } from '../../components/buttons/watch-button';
import type { ClutchResult } from 'csdm/common/types/search/clutch-result';
import { VirtualListResults } from './virtual-list-results';
import { DotSeparator } from './dot-separator';
import { MapImage, MatchDate, PlayerName, RoundNumber, Row, RowLeft, RowRight, TeamSideIcon } from './result-row';
import { SeeMatchButton } from 'csdm/ui/components/buttons/see-match-button';
import { SeeRoundLink } from 'csdm/ui/components/links/see-round-link';

type Props = {
  clutches: ClutchResult[];
};

export function ClutchesResults({ clutches }: Props) {
  return (
    <VirtualListResults
      items={clutches}
      renderItem={(clutch) => {
        return (
          <Row key={clutch.id}>
            <RowLeft>
              <MapImage mapName={clutch.mapName} />
              <TeamSideIcon side={clutch.side} />
              <PlayerName name={clutch.clutcherName} />
              <DotSeparator />
              <p>{clutch.mapName}</p>
              <DotSeparator />
              <RoundNumber roundNumber={clutch.roundNumber} />
              <DotSeparator />
              <MatchDate date={clutch.date} />
            </RowLeft>
            <RowRight>
              <WatchButton
                demoPath={clutch.demoPath}
                game={clutch.game}
                tick={clutch.tick - 64 * 5}
                focusSteamId={clutch.clutcherSteamId}
              />
              <SeeRoundLink checksum={clutch.matchChecksum} roundNumber={clutch.roundNumber} />
              <SeeMatchButton checksum={clutch.matchChecksum} />
            </RowRight>
          </Row>
        );
      }}
    />
  );
}
