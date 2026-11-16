import type { BrowserWindow, MenuItemConstructorOptions, ContextMenuParams } from 'electron';
import { clipboard, ClipboardItem, Menu } from 'electron';
import { type Event } from 'electron';
import { i18n } from '@lingui/core';

function isAppPageLink(linkURL: string) {
  try {
    const url = new URL(linkURL);

    // The app is loaded from a file:// URL in production and from the localhost dev server in development.
    return url.protocol === 'file:' || url.hostname === 'localhost';
  } catch {
    return false;
  }
}

export function listenForContextMenu(mainWindow: BrowserWindow) {
  const onContextMenu = (event: Event, { editFlags, isEditable, linkText, linkURL }: ContextMenuParams) => {
    const items: MenuItemConstructorOptions[] = [];

    // Copying links to app pages is useless as they can't be opened outside of the app.
    if (linkURL.length > 0 && !isAppPageLink(linkURL)) {
      items.push({
        id: 'copyLink',
        label: i18n.t({
          id: 'contextMenu.copyLink',
          message: 'Copy link',
        }),
        click: async () => {
          await clipboard.write([
            new ClipboardItem({
              'text/plain': linkURL,
              'electron application/bookmark': { title: linkText, url: linkURL },
            }),
          ]);
        },
      });
    }

    if (editFlags.canCut) {
      items.push({
        label: i18n.t({
          id: 'contextMenu.cut',
          message: 'Cut',
        }),
        role: 'cut',
        accelerator: 'CommandOrControl+X',
      });
    }

    if (editFlags.canCopy) {
      items.push({
        label: i18n.t({
          id: 'contextMenu.copy',
          message: 'Copy',
        }),
        role: 'copy',
        accelerator: 'CommandOrControl+C',
      });
    }

    if (isEditable && editFlags.canPaste) {
      items.push({
        label: i18n.t({
          id: 'contextMenu.paste',
          message: 'Paste',
        }),
        role: 'paste',
        accelerator: 'CommandOrControl+V',
      });
    }

    if (editFlags.canDelete) {
      items.push(
        {
          type: 'separator',
        },
        {
          label: i18n.t({
            id: 'contextMenu.delete',
            message: 'Delete',
          }),
          role: 'delete',
        },
      );
    }

    if (items.length > 0) {
      const menu = Menu.buildFromTemplate(items);
      menu.popup({
        window: mainWindow,
      });
    }
  };

  mainWindow.webContents.removeAllListeners('context-menu');
  mainWindow.webContents.addListener('context-menu', onContextMenu);
}
