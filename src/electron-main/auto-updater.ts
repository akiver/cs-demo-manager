import { ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { Notification } from 'electron';
import { i18n } from '@lingui/core';
import { windowManager } from './window-manager';
import { IPCChannel } from 'csdm/common/ipc-channel';

autoUpdater.logger = {
  error: logger.error,
  info: logger.log,
  warn: logger.warn,
  debug: logger.log,
};
autoUpdater.disableWebInstaller = true;
autoUpdater.autoDownload = false;

export function initialize(autoDownloadUpdates: boolean) {
  let lastDownloadedVersion: string | null = null;
  let isDownloading = false;
  let shouldDownloadUpdatesAutomatically = autoDownloadUpdates;

  autoUpdater.on('update-available', (event) => {
    const isAlreadyDownloadedVersion = lastDownloadedVersion !== null && lastDownloadedVersion === event.version;
    if (isAlreadyDownloadedVersion) {
      return;
    }

    if (shouldDownloadUpdatesAutomatically) {
      isDownloading = true;
      autoUpdater.downloadUpdate();
      return;
    }

    const notification = new Notification({
      title: i18n.t({
        id: 'notification.downloadAvailable.title',
        message: `A new update is available!`,
      }),
      body: i18n.t({
        id: 'notification.downloadAvailable.body',
        message: 'Click here to download it.',
      }),
    });
    notification.on('click', () => {
      autoUpdater.downloadUpdate();
    });
    notification.show();
  });

  autoUpdater.on('update-downloaded', (event) => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPCChannel.UpdateDownloaded);
    }

    lastDownloadedVersion = event.version;
    isDownloading = false;
  });

  ipcMain.handle(IPCChannel.InstallUpdate, () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle(IPCChannel.HasUpdateReadyToInstall, () => {
    return lastDownloadedVersion !== null;
  });

  ipcMain.handle(IPCChannel.ToggleAutoUpdate, (event, isEnabled: boolean) => {
    shouldDownloadUpdatesAutomatically = isEnabled;
  });

  const checkInterval = 1000 * 60 * 60 * 12; // 12 hours
  setInterval(() => {
    if (!isDownloading) {
      autoUpdater.checkForUpdates();
    }
  }, checkInterval);

  autoUpdater.checkForUpdates();
}
