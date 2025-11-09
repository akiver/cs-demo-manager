import React from 'react';
import { CommentInput } from 'csdm/ui/components/inputs/comment-input';
import { useUpdateRoundComment } from './use-update-round-comment';

type Props = {
  checksum: string;
  number: number;
  comment: string;
};

export function RoundCommentInput({ checksum, number, comment }: Props) {
  const updateComment = useUpdateRoundComment();

  return (
    <CommentInput
      currentComment={comment}
      updateComment={(comment) => {
        updateComment({
          checksum,
          number,
          comment,
        });
      }}
    />
  );
}
