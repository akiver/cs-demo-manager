import React from 'react';
import { Trans } from '@lingui/react/macro';
import { LeftBarLink } from './left-bar-link';
import { UserIcon } from 'csdm/ui/icons/user-icon';
import { RoutePath } from 'csdm/ui/routes-paths';
import { usePinnedPlayerSteamId } from 'csdm/ui/settings/use-pinned-player-steamid';
import { isBlankString } from 'csdm/common/string/is-empty-string';
import { useContextMenu } from 'csdm/ui/components/context-menu/use-context-menu';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { PinPlayerItem } from 'csdm/ui/components/context-menu/items/pin-player-item';

export function PinnedPlayerLink() {
  const pinnedPlayerSteamId = usePinnedPlayerSteamId();
  const { showContextMenu } = useContextMenu();

  const onContextMenu = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isBlankString(pinnedPlayerSteamId)) {
      return;
    }

    showContextMenu(
      event.nativeEvent,
      <ContextMenu>
        <PinPlayerItem steamId={pinnedPlayerSteamId} />
      </ContextMenu>,
    );
  };

  return (
    <LeftBarLink
      icon={<UserIcon />}
      tooltip={<Trans context="Tooltip">Pinned player</Trans>}
      url={RoutePath.PinnerPlayer}
      onContextMenu={onContextMenu}
    />
  );
}
