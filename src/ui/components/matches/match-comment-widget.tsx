import React from 'react';
import { TableCommentWidget } from 'csdm/ui/components/table/comment-widget';
import type { MatchTable } from 'csdm/common/types/match-table';
import { useUpdateComment } from 'csdm/ui/comment/use-update-comment';

type Props = {
  matches: MatchTable[];
  onClose: () => void;
};

export function MatchCommentWidget({ onClose, matches }: Props) {
  const updateComment = useUpdateComment();

  if (matches.length === 0) {
    return null;
  }

  const selectedMatch = matches[0];

  const onBlur = (comment: string) => {
    if (comment === selectedMatch.comment) {
      return;
    }

    updateComment({
      checksum: selectedMatch.checksum,
      comment,
    });
  };

  return (
    <TableCommentWidget
      key={`comment-${selectedMatch.checksum}`}
      comment={selectedMatch.comment}
      onClose={onClose}
      onBlur={onBlur}
    />
  );
}
