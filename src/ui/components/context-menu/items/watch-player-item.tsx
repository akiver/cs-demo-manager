import React from 'react';
import { Trans } from '@lingui/react/macro';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { WatchPlayerHighlightsItem } from './watch-player-highlights-item';
import { WatchPlayerLowlightsItem } from './watch-player-lowlights-item';
import { WatchPlayerAsSuspectItem } from './watch-player-as-suspect-item';
import { Game } from 'csdm/common/types/counter-strike';
import { WatchPlayerRoundsItem } from './watch-player-rounds-item';

type Props = {
  demoPath: string;
  steamId: string;
  game: Game;
};

export function WatchPlayerItem({ demoPath, steamId, game }: Props) {
  return (
    <SubContextMenu label={<Trans context="Context menu">Watch</Trans>}>
      <WatchPlayerRoundsItem steamId={steamId} demoPath={demoPath} />
      <WatchPlayerHighlightsItem steamId={steamId} demoPath={demoPath} game={game} />
      <WatchPlayerLowlightsItem steamId={steamId} demoPath={demoPath} game={game} />
      {/* TODO CS2 Re-enable it if CS2 supports the anonsuspect argument one day */}
      {game === Game.CSGO && <WatchPlayerAsSuspectItem steamId={steamId} demoPath={demoPath} />}
    </SubContextMenu>
  );
}
