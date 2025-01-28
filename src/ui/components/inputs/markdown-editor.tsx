import React from 'react';
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx, editorViewCtx } from '@milkdown/kit/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { history } from '@milkdown/kit/plugin/history';
import { getMarkdown } from '@milkdown/kit/utils';
import { placeholder as placeholderPlugin, placeholderCtx } from 'milkdown-plugin-placeholder';

type Props = {
  defaultValue: string;
  placeholder?: string;
  autoFocus?: boolean;
  isResizable?: boolean;
  onReady?: (editor: Editor) => void;
  onBlur?: (markdown: string) => void;
  onDestroy?: () => void;
};

function MilkdownEditor({ defaultValue, isResizable, autoFocus, placeholder, onReady, onBlur, onDestroy }: Props) {
  useEditor(
    (root) => {
      const editor = Editor.make()
        .config((ctx) => {
          root.classList.add('size-full');
          ctx.set(rootCtx, root);

          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            attributes: {
              class: `appearance-none outline-hidden rounded duration-85 transition-all bg-gray-50 size-full p-8 text-gray-800 border border-gray-400 focus:border-gray-900 placeholder:text-gray-500 disabled:cursor-default disabled:bg-gray-200 disabled:text-gray-500 hover:enabled:focus:border-gray-900 hover:enabled:border-gray-600 overflow-y-auto ${isResizable ? 'resize-y' : 'resize-none'}`,
              spellcheck: 'false',
            },
          }));

          ctx.set(defaultValueCtx, defaultValue);
          ctx.set(placeholderCtx, placeholder ?? '');

          const listenerContext = ctx.get(listenerCtx);
          if (onReady) {
            listenerContext.mounted(() => {
              onReady(editor);
            });
          }

          if (onBlur) {
            listenerContext.blur((ctx) => {
              onBlur(getMarkdown()(ctx));
            });
          }

          if (onDestroy) {
            listenerContext.destroy(onDestroy);
          }

          if (autoFocus) {
            setTimeout(() => {
              const view = ctx.get(editorViewCtx);
              view.focus();
            }, 0);
          }
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(placeholderPlugin)
        .use(listener);

      return editor;
    },
    [placeholder],
  );

  return <Milkdown />;
}

export function MarkdownEditor({
  defaultValue,
  isResizable,
  placeholder,
  autoFocus,
  onReady,
  onBlur,
  onDestroy,
}: Props) {
  return (
    <MilkdownProvider>
      <MilkdownEditor
        isResizable={isResizable}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onDestroy={onDestroy}
        onReady={onReady}
      />
    </MilkdownProvider>
  );
}
