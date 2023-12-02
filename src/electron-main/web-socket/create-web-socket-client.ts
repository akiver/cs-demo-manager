import { MainServerMessageName } from 'csdm/server/main-server-message-name';
import { WebSocketClient } from './web-socket-client';
import { onNewBannedAccounts } from './listeners/on-new-banned-accounts';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';
import { onCheckForNewBannedAccountsError } from './listeners/on-new-banned-accounts-error';
import { onDownloadValveDemoStarted } from './listeners/on-download-valve-demos-started';
import { onDownloadFaceitDemoStarted } from './listeners/on-download-faceit-demos-started';

export function createWebSocketClient() {
  const client = new WebSocketClient();
  client.on(SharedServerMessageName.NewBannedAccounts, onNewBannedAccounts);
  client.on(SharedServerMessageName.NewBannedAccountsError, onCheckForNewBannedAccountsError);
  client.on(MainServerMessageName.DownloadValveDemoStarted, onDownloadValveDemoStarted);
  client.on(MainServerMessageName.DownloadFaceitDemoStarted, onDownloadFaceitDemoStarted);

  return client;
}
