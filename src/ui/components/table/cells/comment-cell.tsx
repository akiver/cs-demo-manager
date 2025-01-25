import React from 'react';
import { CommentDotsIcon } from 'csdm/ui/icons/comment-dots-icon';
import { Tooltip } from '../../tooltip';
import type { CellProps } from '../table-types';
import { MarkdownEditor } from '../../inputs/markdown-editor';

type Props = CellProps<{ comment?: string }>;

export function CommentCell({ data }: Props) {
  const { comment } = data;
  if (comment === undefined || comment === '') {
    return null;
  }

  return (
    <Tooltip delay={0} content={<MarkdownEditor defaultValue={comment} />}>
      <CommentDotsIcon width={12} height={12} />
    </Tooltip>
  );
}
