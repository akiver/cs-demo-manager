import { ipcMain, shell, dialog, app } from 'electron';
import type { SaveDialogOptions, OpenDialogOptions } from 'electron';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { isWindows } from 'csdm/node/os/is-windows';
import { windowManager } from './window-manager';
import { getSystemStartupBehavior, updateSystemStartupBehavior } from 'csdm/electron-main/system-startup-behavior';
import type { StartupBehavior } from 'csdm/common/types/startup-behavior';

// Automatic files selection doesn't work with forward slashes on Windows.
function sanitizePathForFileSelection(path: string) {
  return isWindows ? path.replace(/\//g, '\\') : path;
}

export function registerMainProcessListeners() {
  ipcMain.handle(IPCChannel.BrowseToFile, (event, path: string) => {
    shell.showItemInFolder(sanitizePathForFileSelection(path));
  });

  ipcMain.handle(IPCChannel.BrowseToFolder, async (event, folderPath: string) => {
    try {
      /**
       * ! The additional slash is important because given the following tree:
       * C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive
       * C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\csgo <- a folder
       * C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\csgo.exe
       * When trying to open the csgo folder it will try to open csgo.exe instead.
       */
      await shell.openPath(sanitizePathForFileSelection(`${folderPath}/`));
    } catch (error) {
      logger.error(`Error while opening path: ${folderPath}`);
      logger.error(error);
    }
  });

  ipcMain.handle(IPCChannel.ReloadWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.reload();
    }
  });

  ipcMain.handle(IPCChannel.RestartApp, () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.handle(IPCChannel.GetStartupArguments, () => {
    return windowManager.getStartupArguments();
  });

  ipcMain.handle(IPCChannel.ClearStartupArguments, () => {
    return windowManager.clearStartupArguments();
  });

  ipcMain.handle(IPCChannel.ShowWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });

  ipcMain.handle(IPCChannel.MinimizeWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle(IPCChannel.MaximizeWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.maximize();
    }
  });

  ipcMain.handle(IPCChannel.UnMazimizeWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.unmaximize();
    }
  });

  ipcMain.handle(IPCChannel.CloseWindow, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  ipcMain.handle(IPCChannel.IsWindowMaximized, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      return mainWindow.isMaximized();
    }

    return false;
  });

  ipcMain.handle(IPCChannel.ShowSaveDialog, (event, options: SaveDialogOptions) => {
    const mainWindow = windowManager.getOrCreateMainWindow();
    return dialog.showSaveDialog(mainWindow, options);
  });

  ipcMain.handle(IPCChannel.ShowOpenDialog, (event, options: OpenDialogOptions) => {
    const mainWindow = windowManager.getOrCreateMainWindow();
    return dialog.showOpenDialog(mainWindow, options);
  });

  ipcMain.handle(IPCChannel.CanGoBack, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      return mainWindow.webContents.navigationHistory.canGoBack();
    }

    return false;
  });

  ipcMain.handle(IPCChannel.CanGoForward, () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow !== null && !mainWindow.isDestroyed()) {
      return mainWindow.webContents.navigationHistory.canGoForward();
    }

    return false;
  });

  ipcMain.handle(IPCChannel.GetSystemStartupBehavior, async () => {
    return await getSystemStartupBehavior();
  });

  ipcMain.handle(IPCChannel.UpdateSystemStartupBehavior, async (event, behavior: StartupBehavior) => {
    await updateSystemStartupBehavior(behavior);
  });
}
