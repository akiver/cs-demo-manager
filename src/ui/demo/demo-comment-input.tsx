import React from 'react';
import { Trans } from '@lingui/react/macro';
import { MarkdownEditor } from 'csdm/ui/components/inputs/markdown-editor';
import { useUpdateComment } from 'csdm/ui/comment/use-update-comment';

type Props = {
  checksum: string;
  currentComment: string;
};

export function DemoCommentInput({ checksum, currentComment }: Props) {
  const updateComment = useUpdateComment();

  const onBlur = (comment: string) => {
    if (comment === currentComment) {
      return;
    }

    updateComment({
      checksum,
      comment,
    });
  };

  return (
    <div className="flex flex-col gap-y-8 h-fit">
      <label htmlFor="comment">
        <Trans>Comment:</Trans>
      </label>
      <div className="max-h-[120px]">
        <MarkdownEditor defaultValue={currentComment} onBlur={onBlur} />
      </div>
    </div>
  );
}
