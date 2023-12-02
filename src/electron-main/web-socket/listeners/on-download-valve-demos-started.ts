import { Notification } from 'electron';
import { i18n } from '@lingui/core';
import { windowManager } from 'csdm/electron-main/window-manager';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { StartPath } from 'csdm/common/argument/start-path';
import { IPCChannel } from 'csdm/common/ipc-channel';

export function onDownloadValveDemoStarted() {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }

  const notification = new Notification({
    title: i18n.t({
      id: 'notification.downloadingValveDemo.title',
      message: 'Downloading Valve demos',
    }),
    body: i18n.t({
      id: 'notification.downloadingValveDemo.message',
      message: 'New Valve demos are being downloaded, click here to show them',
    }),
  });

  notification.on('click', () => {
    let mainWindow = windowManager.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
      return;
    }

    windowManager.setStartupArgument(ArgumentName.StartPath, StartPath.Downloads);
    mainWindow = windowManager.getOrCreateMainWindow();
    mainWindow.webContents.send(IPCChannel.NavigateToPendingDownloads);
    mainWindow.show();
    mainWindow.focus();
  });

  notification.show();
}
