import React from 'react';
import { msg } from '@lingui/macro';
import { MarkdownEditor } from './markdown-editor';
import { useI18n } from 'csdm/ui/hooks/use-i18n';

type Props = {
  isResizable?: boolean;
  currentComment: string;
  updateComment: (comment: string) => void;
};

export function CommentInput({ isResizable, currentComment, updateComment }: Props) {
  const _ = useI18n();

  const onBlur = (comment: string) => {
    if (comment === currentComment) {
      return;
    }

    updateComment(comment);
  };

  return (
    <MarkdownEditor
      defaultValue={currentComment}
      onBlur={onBlur}
      isResizable={isResizable}
      placeholder={_(
        msg({
          context: 'Input placeholder',
          message: 'Comment (Markdown supported)',
        }),
      )}
    />
  );
}
