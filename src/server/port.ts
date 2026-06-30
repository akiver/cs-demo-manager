// Default port used by the WebSocket server.
// If the port is already in use, the main process will resolve a free port at startup and expose it to the other
// processes through the CSDM_WS_PORT environment variable.
// ! Must be kept in sync with DEFAULT_WEB_SOCKET_SERVER_PORT in cs2-server-plugin/main.cpp and csgo-server-plugin/main.cpp.
export const DEFAULT_WEB_SOCKET_SERVER_PORT = 4574;

// Name of the environment variable holding the WebSocket server port resolved by the main process.
export const WEB_SOCKET_SERVER_PORT_ENV_NAME = 'CSDM_WS_PORT';

export function getWebSocketServerPort(): number {
  const port = Number(process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME]);

  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : DEFAULT_WEB_SOCKET_SERVER_PORT;
}
