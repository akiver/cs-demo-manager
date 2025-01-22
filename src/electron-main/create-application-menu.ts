import type { MenuItemConstructorOptions } from 'electron';
import { ipcMain, Menu, app, screen, shell } from 'electron';
import { i18n } from '@lingui/core';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { isMac } from 'csdm/node/os/is-mac';
import { windowManager } from 'csdm/electron-main/window-manager';

export function createApplicationMenu() {
  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        {
          label: i18n.t({
            id: 'menu.about',
            message: 'About',
          }),
          click: () => {
            const mainWindow = windowManager.getOrCreateMainWindow();
            mainWindow.webContents.send(IPCChannel.ShowAbout);
          },
        },
        { type: 'separator' },
        {
          label: i18n.t({
            id: 'menu.preferences',
            message: 'Preferences',
          }),
          click: () => {
            const mainWindow = windowManager.getOrCreateMainWindow();
            mainWindow.webContents.send(IPCChannel.ToggleSettingsVisibility);
          },
          accelerator: 'CmdOrCtrl+,',
        },
        { type: 'separator' },
        {
          role: 'services',
          label: i18n.t({
            id: 'menu.services',
            message: 'Services',
          }),
        },
        { type: 'separator' },
        {
          role: 'hide',
          label: i18n.t({
            id: 'menu.hide',
            message: 'Hide CS:DM',
          }),
        },
        {
          role: 'hideOthers',
          label: i18n.t({
            id: 'menu.hideOthers',
            message: 'Hide Others',
          }),
          accelerator: 'Command+Alt+H',
        },
        {
          role: 'unhide',
          label: i18n.t({
            id: 'menu.showAll',
            message: 'Show All',
          }),
        },
        { type: 'separator' },
        {
          label: i18n.t({
            id: 'menu.quit',
            message: 'Quit CS:DM',
          }),
          accelerator: 'CommandOrControl+Q',
          click: (menu, window) => {
            window?.close();
          },
        },
      ],
    });
  } else {
    template.push({
      id: 'file',
      label: i18n.t({
        id: 'menu.file',
        message: 'File',
      }),
      submenu: [
        {
          label: i18n.t({
            id: 'menu.preferences',
            message: 'Preferences',
          }),
          click: () => {
            const mainWindow = windowManager.getOrCreateMainWindow();
            mainWindow.webContents.send(IPCChannel.ToggleSettingsVisibility);
          },
          accelerator: 'CmdOrCtrl+,',
        },
        {
          role: 'quit',
          label: i18n.t({
            id: 'menu.quit',
            message: 'Quit CS:DM',
          }),
        },
      ],
    });
  }

  template.push(
    {
      id: 'edit',
      label: i18n.t({
        id: 'menu.edit',
        message: 'Edit',
      }),
      submenu: [
        {
          label: i18n.t({
            id: 'menu.undo',
            message: 'Undo',
          }),
          role: 'undo',
          accelerator: 'CmdOrCtrl+Z',
        },
        {
          label: i18n.t({
            id: 'menu.redo',
            message: 'Redo',
          }),
          role: 'redo',
          accelerator: isMac ? 'Shift+CommandOrControl+Z' : 'Control+Y',
        },
        {
          type: 'separator',
        },
        {
          label: i18n.t({
            id: 'menu.cut',
            message: 'Cut',
          }),
          role: 'cut',
          accelerator: 'CommandOrControl+X',
        },
        {
          label: i18n.t({
            id: 'menu.copy',
            message: 'Copy',
          }),
          role: 'copy',
          accelerator: 'CommandOrControl+C',
        },
        {
          label: i18n.t({
            id: 'menu.paste',
            message: 'Paste',
          }),
          role: 'paste',
          accelerator: 'CommandOrControl+V',
        },
        {
          label: i18n.t({
            id: 'menu.pasteAndMatchStyle',
            message: 'Paste and Match Style',
          }),
          role: 'pasteAndMatchStyle',
          accelerator: isMac ? 'Cmd+Option+Shift+V' : 'Shift+CommandOrControl+V',
        },
        {
          label: i18n.t({
            id: 'menu.delete',
            message: 'Delete',
          }),
          role: 'delete',
        },
        {
          label: i18n.t({
            id: 'menu.selectAll',
            message: 'Select All',
          }),
          role: 'selectAll',
          accelerator: 'CommandOrControl+A',
        },
      ],
    },
    {
      label: i18n.t({
        id: 'menu.view',
        message: 'View',
      }),
      submenu: [
        {
          label: i18n.t({
            id: 'menu.reload',
            message: 'Reload',
          }),
          role: 'reload',
          accelerator: 'CmdOrCtrl+R',
        },
        {
          label: i18n.t({
            id: 'menu.forceReload',
            message: 'Force Reload',
          }),
          role: 'forceReload',
          accelerator: 'Shift+CmdOrCtrl+R',
        },
        {
          type: 'separator',
        },
        {
          label: i18n.t({
            id: 'menu.toggleFullScreen',
            message: 'Toggle Full Screen',
          }),
          role: 'togglefullscreen',
          accelerator: isMac ? 'Control+Command+F' : 'F11',
        },
        {
          label: 'Toggle Developer Tools',
          role: 'toggleDevTools',
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        },
        {
          type: 'separator',
        },
        {
          label: i18n.t({
            id: 'menu.resetZoom',
            message: 'Actual size',
          }),
          role: 'resetZoom',
          accelerator: 'CommandOrControl+0',
        },
        {
          label: i18n.t({
            id: 'menu.zoomIn',
            message: 'Zoom In',
          }),
          role: 'zoomIn',
          accelerator: 'CommandOrControl+Plus',
        },
        {
          label: i18n.t({
            id: 'menu.zoomOut',
            message: 'Zoom Out',
          }),
          role: 'zoomOut',
          accelerator: 'CommandOrControl+-',
        },
      ],
    },
  );

  if (isMac) {
    template.push({
      label: i18n.t({
        id: 'menu.window',
        message: 'Window',
      }),
      submenu: [
        {
          label: i18n.t({
            id: 'menu.close',
            message: 'Close',
          }),
          role: 'close',
          accelerator: 'CommandOrControl+W',
        },
        {
          label: i18n.t({
            id: 'menu.minimize',
            message: 'Minimize',
          }),
          role: 'minimize',
          accelerator: 'CommandOrControl+M',
        },
        {
          label: i18n.t({
            id: 'menu.zoom',
            message: 'Zoom',
          }),
          role: 'zoom',
        },
        {
          label: i18n.t({
            id: 'menu.tileWindowToLeftOfScreen',
            message: 'Tile Window to Left of Screen',
          }),
          click: () => {
            const display = screen.getPrimaryDisplay();
            const { width, height } = display.bounds;
            const mainWindow = windowManager.getOrCreateMainWindow();
            mainWindow.setBounds({
              x: 0,
              y: height,
              width: width / 2,
              height,
            });
          },
        },
        {
          label: i18n.t({
            id: 'menu.tileWindowToRightOfScreen',
            message: 'Tile Window to Right of Screen',
          }),
          click: () => {
            const display = screen.getPrimaryDisplay();
            const { width, height } = display.bounds;
            const mainWindow = windowManager.getOrCreateMainWindow();
            mainWindow.setBounds({
              x: width / 2,
              y: height,
              width: width / 2,
              height,
            });
          },
        },
        { type: 'separator' },
        {
          label: i18n.t({
            id: 'menu.bringAllToFront',
            message: 'Bring All to Front',
          }),
          role: 'front',
        },
      ],
    });
  }

  template.push({
    label: i18n.t({
      id: 'menu.help',
      message: 'Help',
    }),
    role: 'help',
    submenu: [
      {
        label: i18n.t({
          id: 'menu.documentation',
          message: 'Documentation',
        }),
        click: () => {
          shell.openExternal('https://cs-demo-manager.com/docs');
        },
      },
      {
        label: 'GitHub',
        click: () => {
          shell.openExternal('https://github.com/akiver/cs-demo-manager');
        },
      },
    ],
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipcMain.removeHandler(IPCChannel.ShowTitleBarMenu);
  ipcMain.handle(IPCChannel.ShowTitleBarMenu, () => {
    menu.popup();
  });

  return menu;
}
