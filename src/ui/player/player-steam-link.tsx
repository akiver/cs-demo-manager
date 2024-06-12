import React from 'react';
import { Avatar } from 'csdm/ui/components/avatar';
import { buildPlayerSteamProfileUrl } from 'csdm/ui/shared/build-player-steam-profile-url';
import type { PlayerProfile } from 'csdm/common/types/player-profile';

type Props = {
  player: PlayerProfile;
};

export function PlayerSteamLink({ player }: Props) {
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
