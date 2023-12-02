import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { PinPlayerItem } from 'csdm/ui/components/context-menu/items/pin-player-item';
import { ShowPlayerMatchesItem } from 'csdm/ui/components/context-menu/items/show-player-matches-item';
import { WatchPlayerItem } from 'csdm/ui/components/context-menu/items/watch-player-item';
import { OpenSteamProfileItem } from 'csdm/ui/components/context-menu/items/open-steam-profile-item';
import { SeePlayerProfileItem } from 'csdm/ui/components/context-menu/items/see-player-profile-item';
import { CopySteamIdItem } from '../context-menu/items/copy-steamid-item';
import { Game } from 'csdm/common/types/counter-strike';
import { isCounterStrikeStartable } from 'csdm/ui/hooks/use-counter-strike';

type Props = {
  steamId: string;
  demoPath: string | undefined;
  game: Game;
};

export function ValveScoreboardContextMenu({ steamId, demoPath, game }: Props) {
  const canStartCs = isCounterStrikeStartable(game);
  const canWatchPlayer = demoPath && canStartCs && game === Game.CSGO;

  return (
    <ContextMenu>
      <SeePlayerProfileItem steamId={steamId} />
      {canWatchPlayer && <WatchPlayerItem demoPath={demoPath} steamId={steamId} game={game} />}
      <CopySteamIdItem steamIds={[steamId]} />
      <ShowPlayerMatchesItem steamIds={[steamId]} />
      <OpenSteamProfileItem steamIds={[steamId]} />
      <PinPlayerItem steamId={steamId} />
    </ContextMenu>
  );
}
