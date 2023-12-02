import React from 'react';
import { Avatar } from 'csdm/ui/components/avatar';
import { useUnsafePlayer } from './use-unsafe-player';
import { buildPlayerSteamProfileUrl } from 'csdm/ui/shared/build-player-steam-profile-url';

export function PlayerSteamLink() {
  const player = useUnsafePlayer();

  if (player === undefined) {
    return null;
  }

  return (
    <a
      href={buildPlayerSteamProfileUrl(player.steamId)}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-x-4 w-max"
    >
      <Avatar avatarUrl={player.avatar} size={30} />
      <p className="text-body-strong">{player.name}</p>
    </a>
  );
}
