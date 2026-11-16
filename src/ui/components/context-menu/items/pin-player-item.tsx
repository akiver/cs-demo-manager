import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { usePinnedPlayerSteamId } from 'csdm/ui/settings/use-pinned-player-steamid';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  steamId: string;
};

export function PinPlayerItem({ steamId }: Props) {
  const updateSettings = useUpdateSettings();
  const pinnedPlayerSteamId = usePinnedPlayerSteamId();
  const isPinned = pinnedPlayerSteamId === steamId;

  const onClick = async () => {
    await updateSettings({
      pinnedPlayerSteamId: isPinned ? '' : steamId,
    });
  };

  return (
    <ContextMenuItem onClick={onClick}>
      {isPinned ? (
        <Trans context="Context menu">Unpin this player</Trans>
      ) : (
        <Trans context="Context menu">Pin this player</Trans>
      )}
    </ContextMenuItem>
  );
}
