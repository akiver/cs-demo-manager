import { Notification } from 'electron';
import { i18n } from '@lingui/core';
import { ArgumentName } from 'csdm/common/argument/argument-name';
import { StartPath } from 'csdm/common/argument/start-path';
import { IPCChannel } from 'csdm/common/ipc-channel';
import { windowManager } from './window-manager';

export function showNewBannedPlayersNotification(playerCount: number) {
  const notification = new Notification({
    title: i18n.t({
      id: 'notification.bannedPlayers.title',
      message: `{playerCount} new banned players!`,
      values: { playerCount },
    }),
    body: i18n.t({
      id: 'notification.bannedPlayers.body',
      message: 'Click to see players',
    }),
  });
  notification.on('click', () => {
    windowManager.setStartupArgument(ArgumentName.StartPath, StartPath.Bans);
    const mainWindow = windowManager.getOrCreateMainWindow();
    mainWindow.show();
    mainWindow.webContents.send(IPCChannel.NavigateToBans);
  });
  notification.show();
}
