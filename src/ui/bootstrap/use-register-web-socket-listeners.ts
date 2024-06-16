import { useRegisterAnalysesListeners } from './web-socket-listeners/use-register-analyses-listeners';
import { useRegisterBanListeners } from './web-socket-listeners/use-register-ban-listeners';
import { useRegisterDownloadsListeners } from './web-socket-listeners/use-register-downloads-listeners';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';
import { useRegisterSettingsListeners } from './web-socket-listeners/use-register-settings-listeners';
import { useRegisterVideoQueueListeners } from './web-socket-listeners/use-register-video-queue-listeners';

export function useRegisterWebSocketListeners(client: WebSocketClient) {
  useRegisterAnalysesListeners(client);
  useRegisterBanListeners(client);
  useRegisterDownloadsListeners(client);
  useRegisterSettingsListeners(client);
  useRegisterVideoQueueListeners(client);
}
