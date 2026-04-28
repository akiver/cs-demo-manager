import { app, Menu } from 'electron';
import { i18n } from '@lingui/core';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { windowManager } from './window-manager';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { StartPath } from 'csdm/common/argument/start-path';

export function createTrayMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: i18n.t({
        id: 'trayMenu.openApp',
        message: 'Open CS:DM',
      }),
      click: async () => {
        const mainWindow = await windowManager.getOrCreateMainWindow();
        mainWindow.show();
      },
    },
    {
      label: i18n.t({
        id: 'trayMenu.settings',
        message: 'Settings',
      }),
      click: async () => {
        let mainWindow = windowManager.getMainWindow();
        if (mainWindow === null || mainWindow.isDestroyed()) {
          windowManager.setStartupArgument(ArgumentName.StartPath, StartPath.Settings);
          mainWindow = await windowManager.getOrCreateMainWindow();
        } else {
          mainWindow.webContents.send(IPCChannel.OpenSettings);
        }
        mainWindow.show();
      },
    },
    {
      label: i18n.t({
        id: 'trayMenu.quit',
        message: 'Quit',
      }),
      click: () => {
        app.quit();
      },
    },
  ]);

  return menu;
}
