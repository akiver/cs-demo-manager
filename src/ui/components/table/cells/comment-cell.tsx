import React from 'react';
import { Trans } from '@lingui/react/macro';
import { CommentDotsIcon } from 'csdm/ui/icons/comment-dots-icon';
import { Tooltip } from '../../tooltip';
import type { CellProps } from '../table-types';

type Props = CellProps<{ comment?: string }>;

export function CommentCell({ data }: Props) {
  const { comment } = data;
  if (comment === undefined || comment === '') {
    return null;
  }

  return (
    <Tooltip
      content={
        <p>
          <Trans context="Tooltip">Comment</Trans>
        </p>
      }
    >
      <CommentDotsIcon width={12} height={12} />
    </Tooltip>
  );
}
