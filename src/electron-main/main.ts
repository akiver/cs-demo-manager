process.env.PROCESS_NAME = 'main';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { type BrowserWindow, type Tray, type Event } from 'electron';
import { app, ipcMain, dialog } from 'electron';
import fs from 'fs-extra';
import { i18n } from '@lingui/core';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { createWebSocketServerProcess } from './create-web-socket-server-process';
import { listenForContextMenu } from './listen-for-context-menu';
import { createTray } from './create-tray';
import { loadI18n } from './load-i18n';
import { createTrayMenu } from './create-tray-menu';
import { registerMainProcessListeners } from './register-main-process-listeners';
import { createApplicationMenu } from './create-application-menu';
import { injectPathVariableIntoProcess } from './inject-path-variable-into-process';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { createWebSocketClient } from './web-socket/create-web-socket-client';
import { windowManager } from './window-manager';
import { isMac } from 'csdm/node/os/is-mac';
import { migrateSettings } from 'csdm/node/settings/migrate-settings';
import { MainClientMessageName } from 'csdm/server/main-client-message-name';
import { getSettingsFilePath } from 'csdm/node/settings/get-settings-file-path';
import { updateSystemStartupBehavior } from 'csdm/electron-main/system-startup-behavior';
import { StartupBehavior } from 'csdm/common/types/startup-behavior';
import { initialize } from './auto-updater';

process.on('uncaughtException', logger.error);
process.on('unhandledRejection', logger.error);

// To show the correct app name/icon in notifications on Windows.
app.setAppUserModelId('com.akiver.csdm');

let tray: Tray | undefined;
let isQuitting = false;

const isFirstAppInstance = app.requestSingleInstanceLock();
if (isFirstAppInstance) {
  const sendNavigateToDemo = (mainWindow: BrowserWindow, demoPath: string) => {
    mainWindow.webContents.send(IPCChannel.OpenDemFile, demoPath);
    mainWindow.show();
  };

  const getDemoPathFromArguments = (args: string[]) => {
    return args.find((arg) => arg.endsWith('.dem'));
  };

  app.on('window-all-closed', () => {
    // The default behavior is to quit the app when all windows are closed.
    // Only hide it from the dock to keep the app alive and accessible through the Tray icon.
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on('activate', () => {
    windowManager.getOrCreateMainWindow();
  });

  // MacOS only, triggered when the user opens a file with an extension registered by the app.
  app.on('open-file', (event, filePath) => {
    if (!filePath.endsWith('.dem')) {
      return;
    }

    windowManager.setStartupArgument(ArgumentName.DemoPath, filePath);
    const mainWindow = windowManager.getOrCreateMainWindow();
    sendNavigateToDemo(mainWindow, filePath);
  });

  app.on('second-instance', (event, args: string[]) => {
    const demoPath = getDemoPathFromArguments(args);
    if (typeof demoPath === 'string') {
      windowManager.setStartupArgument(ArgumentName.DemoPath, demoPath);
    }

    const mainWindow = windowManager.getOrCreateMainWindow();
    mainWindow.show();

    if (typeof demoPath === 'string') {
      sendNavigateToDemo(mainWindow, demoPath);
    }
  });

  app.on('ready', async () => {
    await injectPathVariableIntoProcess();

    if (IS_PRODUCTION) {
      createWebSocketServerProcess();
    } else {
      windowManager.createDevWindow();
    }

    const demoPath = getDemoPathFromArguments(process.argv);
    if (typeof demoPath === 'string') {
      windowManager.setStartupArgument(ArgumentName.DemoPath, demoPath);
    }

    const settingsFilePath = getSettingsFilePath();
    const settingsFileExists = await fs.pathExists(settingsFilePath);
    if (!settingsFileExists) {
      updateSystemStartupBehavior(StartupBehavior.Minimized);
    }
    const settings = await migrateSettings();
    await loadI18n(settings.ui.locale);

    tray = createTray();
    createApplicationMenu();
    const client = createWebSocketClient();
    registerMainProcessListeners();

    let isOpenedAtLogin = false;
    let shouldStartMinimized = false;
    if (isMac) {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const { wasOpenedAtLogin, wasOpenedAsHidden } = app.getLoginItemSettings();
      isOpenedAtLogin = wasOpenedAtLogin;
      shouldStartMinimized = isOpenedAtLogin && wasOpenedAsHidden;
    } else {
      isOpenedAtLogin = process.argv.includes('--login');
      shouldStartMinimized = process.argv.includes('--minimized');
    }

    if (isOpenedAtLogin) {
      windowManager.setStartupArgument(ArgumentName.AppOpenedAtLogin, 'true');
    }

    if (shouldStartMinimized) {
      if (app.dock) {
        app.dock.hide(); // Will be restored when the main window is shown.
      }
      client.send({
        name: MainClientMessageName.StartMinimizedMode,
      });
    } else {
      windowManager.getOrCreateMainWindow();
    }

    ipcMain.handle(IPCChannel.LocaleChanged, async (event, locale: string) => {
      await loadI18n(locale);
      tray?.setContextMenu(createTrayMenu());
      createApplicationMenu();
      const mainWindow = windowManager.getOrCreateMainWindow();
      listenForContextMenu(mainWindow);
    });

    if (IS_DEV) {
      const { installDevTools } = await import('./install-dev-tools');
      await installDevTools();
    }

    const quitApp = () => {
      // ! Do not use app.quit() because if the navigation is blocked in the renderer process, it will not work.
      // Using app.exit() bypass event listeners.
      app.exit();
    };

    const onBeforeQuit = async (event: Event) => {
      if (isQuitting || !client.isConnected) {
        return;
      }
      isQuitting = true;
      event.preventDefault();

      const hasPendingAnalyses: boolean = await client.send({
        name: MainClientMessageName.HasPendingAnalyses,
      });

      if (hasPendingAnalyses) {
        const mainWindow = windowManager.getOrCreateMainWindow();
        const { response } = await dialog.showMessageBox(mainWindow, {
          message: i18n.t({
            id: 'dialog.quitApp.confirmation',
            message: 'Demo analyses in progress, do you want to quit?',
          }),
          type: 'warning',
          buttons: [
            i18n.t({
              id: 'yes',
              message: 'Yes',
            }),
            i18n.t({
              id: 'no',
              message: 'No',
            }),
          ],
        });
        if (response === 0) {
          quitApp();
        } else {
          isQuitting = false;
        }
      } else {
        quitApp();
      }
    };

    app.on('before-quit', onBeforeQuit);

    initialize(settings.autoDownloadUpdates);
  });
} else {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow !== null && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
  app.quit();
}
