import React from 'react';
import { ContextMenu } from 'csdm/ui/components/context-menu/context-menu';
import { NavigateToPlayerItem } from '../../components/context-menu/items/navigate-to-player-item';
import { PinPlayerItem } from 'csdm/ui/components/context-menu/items/pin-player-item';
import { CopySteamIdItem } from 'csdm/ui/components/context-menu/items/copy-steamid-item';
import { OpenSteamProfileItem } from 'csdm/ui/components/context-menu/items/open-steam-profile-item';
import { CommentItem } from 'csdm/ui/components/context-menu/items/comment-item';
import { TagsItem } from 'csdm/ui/components/context-menu/items/tags-item';
import { useDialog } from 'csdm/ui/components/dialogs/use-dialog';
import { PlayersTagsDialog } from '../players-tags-dialogs';
import type { PlayerTable } from 'csdm/common/types/player-table';
import { Separator } from 'csdm/ui/components/context-menu/separator';

type Props = {
  players: PlayerTable[];
  onCommentClick: () => void;
};

export function PlayerContextMenu({ players, onCommentClick }: Props) {
  const { showDialog } = useDialog();

  if (players.length === 0) {
    return null;
  }
  const playerSteamIds = players.map((player) => player.steamId);
  const selectedPlayerSteamId = playerSteamIds[playerSteamIds.length - 1];

  const onTagsClick = () => {
    const tagIds = players.flatMap((player) => player.tagIds);
    showDialog(<PlayersTagsDialog steamIds={playerSteamIds} defaultTagIds={tagIds} />);
  };

  return (
    <ContextMenu>
      <NavigateToPlayerItem steamId={selectedPlayerSteamId} />
      <Separator />
      <CommentItem onClick={onCommentClick} isDisabled={playerSteamIds.length !== 1} />
      <TagsItem onClick={onTagsClick} />
      <Separator />
      <CopySteamIdItem steamIds={playerSteamIds} />
      <OpenSteamProfileItem steamIds={playerSteamIds} />
      <PinPlayerItem steamId={selectedPlayerSteamId} />
    </ContextMenu>
  );
}
