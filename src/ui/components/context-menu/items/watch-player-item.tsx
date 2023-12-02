import React from 'react';
import { Trans } from '@lingui/macro';
import { SubContextMenu } from 'csdm/ui/components/context-menu/sub-context-menu';
import { WatchPlayerHighlightsItem } from './watch-player-highlights-item';
import { WatchPlayerLowlightsItem } from './watch-player-lowlights-item';
import { WatchPlayerAsSuspectItem } from './watch-player-as-suspect-item';
import { Game } from 'csdm/common/types/counter-strike';

type Props = {
  demoPath: string;
  steamId: string;
  game: Game;
};

export function WatchPlayerItem({ demoPath, steamId, game }: Props) {
  return (
    <SubContextMenu label={<Trans context="Context menu">Watch</Trans>}>
      <WatchPlayerHighlightsItem steamId={steamId} demoPath={demoPath} game={game} />
      <WatchPlayerLowlightsItem steamId={steamId} demoPath={demoPath} game={game} />
      {game === Game.CSGO && <WatchPlayerAsSuspectItem steamId={steamId} demoPath={demoPath} />}
    </SubContextMenu>
  );
}
