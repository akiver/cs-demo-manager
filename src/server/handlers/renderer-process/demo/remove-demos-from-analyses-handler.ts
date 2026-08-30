import { analysesListener } from 'csdm/server/analyses-listener';
import { server } from 'csdm/server/server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';

export async function removeDemosFromAnalysesHandler(checksums: string[]) {
  analysesListener.removeDemosByChecksums(checksums);

  server.sendPushMessage({
    name: ServerPushMessageName.DemosRemovedFromAnalyses,
    payload: checksums,
  });

  return Promise.resolve();
}
