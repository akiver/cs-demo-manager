import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { MarkdownEditor } from './markdown-editor';

type Props = {
  isResizable?: boolean;
  currentComment: string;
  updateComment: (comment: string) => void;
};

export function CommentInput({ isResizable, currentComment, updateComment }: Props) {
  const { t } = useLingui();

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
      placeholder={t({
        context: 'Input placeholder',
        message: 'Comment (Markdown supported)',
      })}
    />
  );
}
