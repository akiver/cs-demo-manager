import { MainClientMessageName } from 'csdm/server/main-client-message-name';
import type { Handler } from 'csdm/server/handler';
import { hasPendingAnalysesHandler } from './main-process/has-pending-analyses-handler';
import { startMinimizedModeHandler } from './main-process/start-minimized-mode-handler';

export interface MainMessageHandlers {
  [MainClientMessageName.HasPendingAnalyses]: Handler<void, boolean>;
  [MainClientMessageName.StartMinimizedMode]: Handler;
}

// Mapping between message names and server handlers sent from the Electron main process to the WebSocket server.
export const mainHandlers: MainMessageHandlers = {
  [MainClientMessageName.HasPendingAnalyses]: hasPendingAnalysesHandler,
  [MainClientMessageName.StartMinimizedMode]: startMinimizedModeHandler,
};
