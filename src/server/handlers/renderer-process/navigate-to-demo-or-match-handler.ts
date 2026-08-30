import { isDemoByPathInDatabase } from 'csdm/node/database/demos/is-demo-by-path-in-database';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';

export async function navigateToDemoOrMatch(demoPath: string) {
  const isDemoInDatabase: boolean = await isDemoByPathInDatabase(demoPath);

  if (isDemoInDatabase) {
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    server.sendPushMessage({
      name: ServerPushMessageName.NavigateToMatch,
      payload: checksum,
    });
  } else {
    server.sendPushMessage({
      name: ServerPushMessageName.NavigateToDemo,
      payload: demoPath,
    });
  }
}
