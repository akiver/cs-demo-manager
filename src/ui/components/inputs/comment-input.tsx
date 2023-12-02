import React from 'react';
import { msg } from '@lingui/macro';
import { TextArea } from 'csdm/ui/components/inputs/text-area';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  isResizable?: boolean;
  currentComment: string;
  updateComment: (comment: string) => void;
};

export function CommentInput({ isResizable, currentComment, updateComment }: Props) {
  const _ = useI18n();

  const onBlur = (event: React.FocusEvent) => {
    if (!(event.target instanceof HTMLTextAreaElement)) {
      return;
    }

    const comment = event.target.value;
    if (currentComment === comment) {
      return;
    }

    updateComment(comment);
  };

  return (
    <TextArea
      id="comment"
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Comment',
        }),
      )}
      defaultValue={currentComment}
      onBlur={onBlur}
      resizable={isResizable}
    />
  );
}
