import { Notification } from 'electron';
import { i18n } from '@lingui/core';
import { windowManager } from 'csdm/electron-main/window-manager';
import { ErrorCode } from 'csdm/common/error-code';
import type { WebSocketClient } from '../web-socket-client';

export function onCheckForNewBannedAccountsError(client: WebSocketClient, errorCode: ErrorCode) {
  const mainWindow = windowManager.getMainWindow();
  if (mainWindow !== null && !mainWindow.isDestroyed() && mainWindow.isFocused()) {
    return;
  }

  let message: string;
  switch (errorCode) {
    case ErrorCode.SteamApiForbidden:
      message = i18n.t({
        id: 'notification.steamApi.forbiddenError',
        message: 'The Steam API returned a forbidden error',
      });
      break;
    case ErrorCode.SteamApiTooManyRequests:
      message = i18n.t({
        id: 'notification.steamApi.tooManyRequestsError',
        message: 'Steam API returned a 429 status code',
      });
      break;
    default:
      message = i18n.t({
        id: 'notification.steamApi.unknownError',
        message: 'An error occurred while checking for new banned Steam accounts (code {errorCode})',
        values: { errorCode },
      });
  }

  const notification = new Notification({
    title: i18n.t({
      id: 'notification.steamApi.title',
      message: 'Steam API error',
    }),
    body: message,
  });
  notification.show();
}
