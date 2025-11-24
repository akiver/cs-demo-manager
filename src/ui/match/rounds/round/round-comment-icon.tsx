import React from 'react';
import { Tooltip } from 'csdm/ui/components/tooltip';
import { CommentDotsIcon } from 'csdm/ui/icons/comment-dots-icon';
import { Markdown } from 'csdm/ui/components/markdown';

type Props = {
  comment: string;
};

export function RoundCommentIcon({ comment }: Props) {
  return (
    <Tooltip
      content={
        <div className="max-h-[400px] overflow-hidden">
          <Markdown markdown={comment} />
        </div>
      }
    >
      <CommentDotsIcon className="size-16" />
    </Tooltip>
  );
}
