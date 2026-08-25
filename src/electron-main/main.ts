process.env.PROCESS_NAME = 'main';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import { type BrowserWindow, type Tray } from 'electron';
import { app, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'fs-extra';
import { IPCChannel } from 'csdm/common/ipc-channel';
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
import { MainClientMessageName } from 'csdm/server/messages/main-client-message-name';
import { getSettingsFilePath } from 'csdm/node/settings/get-settings-file-path';
import { updateSystemStartupBehavior } from 'csdm/electron-main/system-startup-behavior';
import { StartupBehavior } from 'csdm/common/types/startup-behavior';
import { initialize } from './auto-updater';
import { getSettingsSync } from 'csdm/node/settings/get-settings';
import { attachOrSpawnDaemon } from 'csdm/node/daemon/attach-or-spawn-daemon';
import { WEB_SOCKET_SERVER_PORT_ENV_NAME } from 'csdm/server/port';

process.on('uncaughtException', logger.error);
process.on('unhandledRejection', logger.error);

let tray: Tray | undefined;

// To show the correct app name/icon in notifications on Windows.
app.setAppUserModelId('com.akiver.csdm');

const settings = getSettingsSync();
if (settings.ui.enableHardwareAcceleration === false) {
  app.disableHardwareAcceleration();
}

app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch(
  'disable-features',
  ['UseEcoQoSForBackgroundProcess', 'IntensiveWakeUpThrottling'].join(','),
);

async function start() {
  await app.whenReady();

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

  app.on('activate', async () => {
    await windowManager.getOrCreateMainWindow();
  });

  // MacOS only, triggered when the user opens a file with an extension registered by the app.
  app.on('open-file', async (event, filePath) => {
    if (!filePath.endsWith('.dem')) {
      return;
    }

    windowManager.setStartupArgument(ArgumentName.DemoPath, filePath);
    const mainWindow = await windowManager.getOrCreateMainWindow();
    sendNavigateToDemo(mainWindow, filePath);
  });

  app.on('second-instance', async (event, args: string[]) => {
    const demoPath = getDemoPathFromArguments(args);
    if (typeof demoPath === 'string') {
      windowManager.setStartupArgument(ArgumentName.DemoPath, demoPath);
    }

    const mainWindow = await windowManager.getOrCreateMainWindow();
    mainWindow.show();

    if (typeof demoPath === 'string') {
      sendNavigateToDemo(mainWindow, demoPath);
    }
  });

  await injectPathVariableIntoProcess();

  // Attach to the WebSocket server daemon, spawning it first if it's not already running (e.g. started by the CLI).
  // The daemon outlives the app so in-progress work (analyses, videos…) continues after the app quits.
  const webSocketServerPort = await attachOrSpawnDaemon({
    serverBundlePath: path.join(app.getAppPath(), 'server.js'),
    execPath: process.execPath,
    runAsNode: true,
    enableInspector: IS_DEV,
  });
  // Expose the port through an environment variable inherited by the renderer process.
  process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME] = String(webSocketServerPort);
  logger.log(`WebSocket server daemon listening on port ${webSocketServerPort}`);

  const demoPath = getDemoPathFromArguments(process.argv);
  if (typeof demoPath === 'string') {
    windowManager.setStartupArgument(ArgumentName.DemoPath, demoPath);
  }

  const settingsFilePath = getSettingsFilePath();
  const settingsFileExists = await fs.pathExists(settingsFilePath);
  if (!settingsFileExists) {
    await updateSystemStartupBehavior(StartupBehavior.Minimized);
  }
  const settings = await migrateSettings();
  await loadI18n(settings.ui.locale);

  initialize(settings.autoDownloadUpdates);

  tray = createTray();
  const client = createWebSocketClient();
  createApplicationMenu(client);
  registerMainProcessListeners();

  let isOpenedAtLogin = false;
  let shouldStartMinimized = false;
  if (isMac) {
    // oxlint-disable-next-line typescript/no-deprecated
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
    await client.send({
      name: MainClientMessageName.StartMinimizedMode,
    });
  } else {
    await windowManager.getOrCreateMainWindow();
  }

  ipcMain.handle(IPCChannel.LocaleChanged, async (event, locale: string) => {
    await loadI18n(locale);
    tray?.setContextMenu(createTrayMenu());
    createApplicationMenu(client);
    const mainWindow = await windowManager.getOrCreateMainWindow();
    listenForContextMenu(mainWindow);
  });

  if (IS_DEV) {
    const { installDevTools } = await import('./install-dev-tools');
    await installDevTools();
  }

  // Note: in-progress analyses and videos are not a reason to prevent quitting anymore, the daemon outlives the app
  // and completes them in the background.
}

const isFirstAppInstance = app.requestSingleInstanceLock();
if (isFirstAppInstance) {
  void start();
} else {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow !== null && !mainWindow.isDestroyed()) {
    mainWindow.show();
  }
  app.quit();
}
