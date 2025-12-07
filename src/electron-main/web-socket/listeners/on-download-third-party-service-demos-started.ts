import { Notification } from 'electron';
import { windowManager } from 'csdm/electron-main/window-manager';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { StartPath } from 'csdm/common/argument/start-path';
import { IPCChannel } from 'csdm/common/ipc-channel';

type Params = {
  title: string;
  message: string;
};

export function onDownloadThirdPartyServiceDemosStarted(params: Params) {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }

  const notification = new Notification({
    title: params.title,
    body: params.message,
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
