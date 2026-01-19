import { showNewBannedPlayersNotification } from 'csdm/electron-main/show-new-banned-players-notification';
import { windowManager } from 'csdm/electron-main/window-manager';

export function onNewBannedAccounts(steamIds: string[]) {
  // Show an OS notification only if the window doesn't exists or is not focused.
  // If the window exists and is focused the renderer process will handle the message and shows an animated badge counter in the sidebar links.
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow === null || (mainWindow !== null && mainWindow.isDestroyed()) || !mainWindow.isFocused()) {
    showNewBannedPlayersNotification(steamIds.length);
  }
}
