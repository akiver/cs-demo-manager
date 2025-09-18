import React, { useRef } from 'react';
import { CloseButton } from 'csdm/ui/components/buttons/close-button';
import { MarkdownEditor } from '../inputs/markdown-editor';
import { editorViewCtx, type Editor } from '@milkdown/kit/core';

type Props = {
  key: string; // The key is important to re-render the component when the selected row changed.
  comment: string;
  onBlur: (comment: string) => void;
  onClose: () => void;
};

export function TableCommentWidget({ onClose, comment, onBlur }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const activeElementOnMount = useRef(document.activeElement);

  const onKeyDown = (event: KeyboardEvent) => {
    if (editorRef.current && event.key === 'Tab') {
      const view = editorRef.current.ctx.get(editorViewCtx);
      if (document.activeElement !== view.dom) {
        event.preventDefault();
        view.focus();
      }
    }
  };

  const onReady = (editor: Editor) => {
    editorRef.current = editor;
    window.addEventListener('keydown', onKeyDown);
  };

  const onDestroy = () => {
    if (activeElementOnMount.current instanceof HTMLElement) {
      activeElementOnMount.current.focus();
    }
    window.removeEventListener('keydown', onKeyDown);
  };

  return (
    <div className="absolute top-[84px] right-16 z-1 flex flex-col gap-y-8 rounded-8 border border-gray-300 bg-gray-75 p-16 shadow-[0_0_4px_0_var(--color-gray-500)]">
      <div className="h-[300px] w-[500px]">
        <MarkdownEditor defaultValue={comment} onReady={onReady} onDestroy={onDestroy} onBlur={onBlur} />
      </div>
      <div>
        <CloseButton onClick={onClose} />
      </div>
    </div>
  );
}
