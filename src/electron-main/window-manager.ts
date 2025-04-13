import path from 'node:path';
import { BrowserWindow, app, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import type { Argument } from 'csdm/common/types/argument';
import { getArgumentValueFromArray } from 'csdm/electron-main/get-argument-value-from-array';
import { listenForContextMenu } from 'csdm/electron-main/listen-for-context-menu';

class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private devWindow: BrowserWindow | null = null;
  private startupArguments: Argument[] = [];

  public constructor() {
    for (const argumentName of Object.values(ArgumentName)) {
      const value = getArgumentValueFromArray(process.argv, argumentName);
      if (typeof value === 'string') {
        this.startupArguments.push({
          name: argumentName,
          value,
        });
      }
    }
  }

  public getStartupArguments = () => {
    return this.startupArguments;
  };

  public clearStartupArguments = () => {
    this.startupArguments = [];
  };

  public setStartupArgument = (argumentName: ArgumentName, value: string) => {
    const argumentIndex = this.startupArguments.findIndex((arg) => arg.name === argumentName);
    if (argumentIndex === -1) {
      this.startupArguments.push({
        name: argumentName,
        value,
      });
    } else {
      this.startupArguments[argumentIndex].value = value;
    }
  };

  public getOrCreateMainWindow = () => {
    if (this.mainWindow === null || this.mainWindow.isDestroyed()) {
      this.mainWindow = this.createMainWindow();
    }

    return this.mainWindow;
  };

  public getMainWindow() {
    return this.mainWindow;
  }

  public getDevWindow() {
    return this.devWindow;
  }

  public createDevWindow(): BrowserWindow {
    const windowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 768,
      file: `window-state-dev.json`,
    });

    const devWindow = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(app.getAppPath(), 'dev-preload.js'),
        contextIsolation: false,
      },
      backgroundColor: '#080808',
    });

    windowState.manage(devWindow);

    devWindow.on('close', () => {
      app.exit();
    });

    devWindow.webContents.openDevTools();
    devWindow.loadFile('dev.html');

    return devWindow;
  }

  private createMainWindow() {
    const windowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 768,
      file: `window-state-main.json`,
    });
    const mainWindow = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
      minWidth: 500,
      minHeight: 400,
      webPreferences: {
        preload: path.join(app.getAppPath(), 'preload.js'),
        sandbox: false,
        // Disable webSecurity in dev mode only to allow local files access
        webSecurity: IS_PRODUCTION,
      },
      frame: false,
      titleBarStyle: 'hiddenInset',
      // Show the window only when the event 'ready-to-show' is triggered in prod mode, it can be useful in dev mode
      show: IS_DEV,
      backgroundColor: '#000',
    });

    windowState.manage(mainWindow);

    mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send(IPCChannel.WindowUnMaximized);
    });

    mainWindow.on('maximize', () => {
      mainWindow.webContents.send(IPCChannel.WindowMaximized);
    });

    mainWindow.on('close', () => {
      mainWindow.webContents.send(IPCChannel.WindowClose);
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('show', () => {
      if (app.dock) {
        app.dock.show();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (this.isAllowedUrl(url)) {
        shell.openExternal(url);
      }

      return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event) => {
      event.preventDefault();
    });

    if (IS_DEV) {
      mainWindow.webContents.on('devtools-opened', () => {
        setImmediate(() => {
          mainWindow.focus();
        });
      });
      mainWindow.webContents.openDevTools();
    }

    if (IS_DEV) {
      mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile('index.html');
    }

    listenForContextMenu(mainWindow);

    return mainWindow;
  }

  private isAllowedUrl(url: string) {
    const allowedWebsites = [
      'https://cs-demo-manager.com/',
      'https://github.com/',
      'https://steamcommunity.com/',
      'https://ffmpeg.org/',
      'http://www.virtualdub.org/',
      'https://www.faceit.com/',
      'https://support.apple.com/',
      'https://www.advancedfx.org/',
      'https://docs.faceit.com/',
      'https://discord.com/',
      'https://www.5eplay.com/',
      'https://arena.5eplay.com/',
      'https://renown.gg/',
      'https://esplay.com/',
    ];

    for (const website of allowedWebsites) {
      if (url.startsWith(website)) {
        return true;
      }
    }

    return false;
  }
}

export const windowManager = new WindowManager();
