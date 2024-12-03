import React from 'react';
import { Trans } from '@lingui/react/macro';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { ContextMenuItem } from '../context-menu-item';

type Props = {
  steamId: string;
};

export function PinPlayerItem({ steamId }: Props) {
  const updateSettings = useUpdateSettings();

  const onClick = () => {
    updateSettings({
      pinnedPlayerSteamId: steamId,
    });
  };

  return (
    <ContextMenuItem onClick={onClick}>
      <Trans context="Context menu">Pin this player</Trans>
    </ContextMenuItem>
  );
}
