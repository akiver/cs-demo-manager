import React from 'react';
import { TableCommentWidget } from 'csdm/ui/components/table/comment-widget';
import { useUpdatePlayerComment } from 'csdm/ui/player/use-update-player-comment';
import type { PlayerTable } from 'csdm/common/types/player-table';

type Props = {
  players: PlayerTable[];
  onClose: () => void;
};

export function PlayerCommentWidget({ onClose, players }: Props) {
  const updateComment = useUpdatePlayerComment();

  if (players.length === 0) {
    return null;
  }

  const selectedPlayer = players[0];

  const onBlur = (comment: string) => {
    if (comment === selectedPlayer.comment) {
      return;
    }

    updateComment({
      steamId: selectedPlayer.steamId,
      comment,
    });
  };

  return (
    <TableCommentWidget
      key={`comment-${selectedPlayer.steamId}`}
      comment={selectedPlayer.comment}
      onClose={onClose}
      onBlur={onBlur}
    />
  );
}
