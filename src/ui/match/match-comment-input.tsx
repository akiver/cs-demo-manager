import React from 'react';
import { useCurrentMatch } from './use-current-match';
import { useUpdateComment } from 'csdm/ui/comment/use-update-comment';
import { CommentInput } from '../components/inputs/comment-input';

type Props = {
  isResizable?: boolean;
};

export function MatchCommentInput({ isResizable = false }: Props) {
  const match = useCurrentMatch();
  const updateComment = useUpdateComment();

  return (
    <CommentInput
      isResizable={isResizable}
      currentComment={match.comment}
      updateComment={(comment) => {
        updateComment({
          checksum: match.checksum,
          comment,
        });
      }}
    />
  );
}
