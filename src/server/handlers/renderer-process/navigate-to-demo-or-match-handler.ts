import { isDemoByPathInDatabase } from 'csdm/node/database/demos/is-demo-by-path-in-database';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';

export async function navigateToDemoOrMatch(demoPath: string) {
  const isDemoInDatabase: boolean = await isDemoByPathInDatabase(demoPath);

  if (isDemoInDatabase) {
    const checksum = await getDemoChecksumFromDemoPath(demoPath);
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.NavigateToMatch,
      payload: checksum,
    });
  } else {
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.NavigateToDemo,
      payload: demoPath,
    });
  }
}
