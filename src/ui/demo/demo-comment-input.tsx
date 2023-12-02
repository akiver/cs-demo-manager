import React from 'react';
import { Trans } from '@lingui/macro';
import { TextArea } from 'csdm/ui/components/inputs/text-area';
import { useUpdateComment } from 'csdm/ui/comment/use-update-comment';

type Props = {
  checksum: string;
  currentComment: string | undefined;
};

export function DemoCommentInput({ checksum, currentComment }: Props) {
  const updateComment = useUpdateComment();

  const onBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const comment = event.target.value;
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
      <TextArea id="comment" defaultValue={currentComment} onBlur={onBlur} style={{ height: 120 }} />
    </div>
  );
}
