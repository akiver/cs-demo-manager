import { Notification } from 'electron';
import { i18n } from '@lingui/core';
import { windowManager } from 'csdm/electron-main/window-manager';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { StartPath } from 'csdm/common/argument/start-path';
import { IPCChannel } from 'csdm/common/ipc-channel';

export function onDownloadFaceitDemoStarted() {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }

  const notification = new Notification({
    title: i18n.t({
      id: 'notification.downloadingFaceitDemo.title',
      message: 'Downloading FACEIT demos',
    }),
    body: i18n.t({
      id: 'notification.downloadingFaceitDemo.message',
      message: 'New FACEIT demos are being downloaded, click here to show them',
    }),
  });

  notification.on('click', () => {
    const mainWindow = windowManager.getOrCreateMainWindow();
    windowManager.setStartupArgument(ArgumentName.StartPath, StartPath.Downloads);
    mainWindow.webContents.send(IPCChannel.NavigateToPendingDownloads);
    mainWindow.show();
    mainWindow.focus();
  });

  notification.show();
}
