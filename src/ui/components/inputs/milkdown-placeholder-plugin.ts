import { createSlice, createTimer, type MilkdownPlugin, type TimerType } from '@milkdown/kit/ctx';
import { InitReady, prosePluginsCtx } from '@milkdown/kit/core';
import { Plugin, PluginKey } from '@milkdown/kit/prose/state';
import type { EditorView } from '@milkdown/kit/prose/view';

export const placeholderCtx = createSlice('', 'placeholder');
const placeholderTimerCtx = createSlice<TimerType[]>([], 'placeholderTimer');
// oxlint-disable-next-line lingui/no-unlocalized-strings
const PlaceholderReady = createTimer('PlaceholderReady');

const key = new PluginKey('MILKDOWN_PLACEHOLDER');

export const placeholder: MilkdownPlugin = (ctx) => {
  ctx.inject(placeholderCtx).inject(placeholderTimerCtx, [InitReady]).record(PlaceholderReady);

  return async () => {
    await ctx.waitTimers(placeholderTimerCtx);

    const update = (view: EditorView) => {
      const text = ctx.get(placeholderCtx);
      const doc = view.state.doc;
      const first = doc.firstChild;
      const isEmpty =
        view.editable &&
        doc.childCount === 1 &&
        first?.isTextblock === true &&
        first.content.size === 0 &&
        first.type.name === 'paragraph';

      if (isEmpty) {
        view.dom.setAttribute('data-placeholder', text);
      } else {
        view.dom.removeAttribute('data-placeholder');
      }
    };

    const prosePlugins = ctx.get(prosePluginsCtx);
    ctx.set(prosePluginsCtx, [
      ...prosePlugins,
      new Plugin({
        key,
        view(view) {
          update(view);
          return { update };
        },
      }),
    ]);

    ctx.done(PlaceholderReady);
  };
};
