import React from 'react';
import { Trans } from '@lingui/react/macro';
import { ContextMenuItem } from 'csdm/ui/components/context-menu/context-menu-item';
import { buildPlayerSteamProfileUrl } from 'csdm/ui/shared/build-player-steam-profile-url';

type Props = {
  steamIds: string[];
};

export function OpenSteamProfileItem({ steamIds }: Props) {
  const onClick = () => {
    for (const steamId of steamIds.slice(0, 10)) {
      window.open(buildPlayerSteamProfileUrl(steamId), '_blank');
    }
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Open Steam community profile</Trans>
    </ContextMenuItem>
  );
}
