import { Tray } from 'electron';
import path from 'node:path';
import { createTrayMenu } from './create-tray-menu';
import { windowManager } from './window-manager';
import { isMac } from 'csdm/node/os/is-mac';
import { isWindows } from 'csdm/node/os/is-windows';
import { getStaticFolderPath } from 'csdm/node/filesystem/get-static-folder-path';

export function createTray() {
  const iconName = isMac ? 'trayTemplate.png' : isWindows ? 'tray.ico' : 'tray.png';
  const trayIconPath = path.join(getStaticFolderPath(), 'images', 'tray', iconName);
  const tray = new Tray(trayIconPath);

  // ! 'double-click' event doesn't work on macOS when using setContextMenu()
  tray.on('double-click', () => {
    const devWindow = windowManager.getDevWindow();
    if (devWindow !== null) {
      devWindow.show();
    }

    const mainWindow = windowManager.getOrCreateMainWindow();
    mainWindow.show();
  });

  const contextMenu = createTrayMenu();
  tray.setContextMenu(contextMenu);
  tray.setToolTip('CS Demo Manager');

  return tray;
}
