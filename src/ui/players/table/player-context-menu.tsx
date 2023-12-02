import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { NavigateToPlayerItem } from '../../components/context-menu/items/navigate-to-player-item';
import { PinPlayerItem } from 'csdm/ui/components/context-menu/items/pin-player-item';
import { CopySteamIdItem } from 'csdm/ui/components/context-menu/items/copy-steamid-item';
import { OpenSteamProfileItem } from 'csdm/ui/components/context-menu/items/open-steam-profile-item';
import { CommentItem } from 'csdm/ui/components/context-menu/items/comment-item';

type Props = {
  playerSteamIds: string[];
  onCommentClick: () => void;
};

export function PlayerContextMenu({ playerSteamIds, onCommentClick }: Props) {
  if (playerSteamIds.length === 0) {
    return null;
  }
  const selectedPlayerSteamId = playerSteamIds[playerSteamIds.length - 1];

  return (
    <ContextMenu>
      <NavigateToPlayerItem steamId={selectedPlayerSteamId} />
      <CommentItem onClick={onCommentClick} isDisabled={playerSteamIds.length !== 1} />
      <CopySteamIdItem steamIds={playerSteamIds} />
      <OpenSteamProfileItem steamIds={playerSteamIds} />
      <PinPlayerItem steamId={selectedPlayerSteamId} />
    </ContextMenu>
  );
}
