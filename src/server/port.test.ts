import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_WEB_SOCKET_SERVER_PORT, getWebSocketServerPort, WEB_SOCKET_SERVER_PORT_ENV_NAME } from './port';

describe('getWebSocketServerPort', () => {
  it('should return the default port when the environment variable is not set', () => {
    delete process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME];

    expect(getWebSocketServerPort()).toBe(DEFAULT_WEB_SOCKET_SERVER_PORT);
  });

  it('should return the port from the environment variable when set', () => {
    process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME] = '54321';

    expect(getWebSocketServerPort()).toBe(54321);
  });

  it('should return the default port when the environment variable is not a valid port', () => {
    process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME] = 'not-a-port';

    expect(getWebSocketServerPort()).toBe(DEFAULT_WEB_SOCKET_SERVER_PORT);

    process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME] = '0';

    expect(getWebSocketServerPort()).toBe(DEFAULT_WEB_SOCKET_SERVER_PORT);
  });
});
