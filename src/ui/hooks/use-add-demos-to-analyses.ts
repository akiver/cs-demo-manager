import type { Demo } from 'csdm/common/types/demo';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from './use-web-socket-client';

export function useAddDemosToAnalyses() {
  const client = useWebSocketClient();

  return async (demos: Demo[]) => {
    await client.send({
      name: RendererClientMessageName.AddDemosToAnalyses,
      payload: demos,
    });
  };
}
