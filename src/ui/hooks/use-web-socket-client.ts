import { useContext } from 'react';
import { WebSocketContext } from '../bootstrap/web-socket-provider';

export function useWebSocketClient() {
  const client = useContext(WebSocketContext);

  if (client === null) {
    throw new Error('WebSocket client not initialized');
  }

  return client;
}
