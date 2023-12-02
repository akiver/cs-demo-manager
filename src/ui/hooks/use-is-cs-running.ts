import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from './use-web-socket-client';

export function useIsCsRunning() {
  const client = useWebSocketClient();

  return async () => {
    const csIsRunning = await client.send({
      name: RendererClientMessageName.IsCsRunning,
    });

    return csIsRunning;
  };
}
