// Default port used by the WebSocket server.
// If the port is already in use by another application, the server falls back to a random port exposed to the other
// processes through the CSDM_WS_PORT environment variable and the daemon info file.
// ! Must be kept in sync with DEFAULT_WEB_SOCKET_SERVER_PORT in cs2-server-plugin/main.cpp and csgo-server-plugin/main.cpp.
const DEFAULT_WEB_SOCKET_SERVER_PORT = 4574;

// Name of the environment variable holding the WebSocket server port resolved by the main process.
export const WEB_SOCKET_SERVER_PORT_ENV_NAME = 'CSDM_WS_PORT';

export function getWebSocketServerPort(): number {
  const port = Number(process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME]);

  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : DEFAULT_WEB_SOCKET_SERVER_PORT;
}
