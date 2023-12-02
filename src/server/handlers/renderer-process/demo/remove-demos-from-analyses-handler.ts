import { analysesListener } from 'csdm/server/analyses-listener';
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';

export async function removeDemosFromAnalysesHandler(checksums: string[]) {
  analysesListener.removeDemosByChecksums(checksums);

  server.sendMessageToRendererProcess({
    name: RendererServerMessageName.DemosRemovedFromAnalyses,
    payload: checksums,
  });

  return Promise.resolve();
}
