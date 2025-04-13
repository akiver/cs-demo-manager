process.env.PROCESS_NAME = 'server';
import '../common/install-source-map-support';
import 'csdm/node/logger';
import type { RawData } from 'ws';
import type WebSocket from 'ws';
import { WebSocketServer as WSServer } from 'ws';
import type { IncomingMessage } from 'node:http';
import { URL } from 'node:url';
import { rendererHandlers } from 'csdm/server/handlers/renderer-handlers-mapping';
import { mainHandlers } from 'csdm/server/handlers/main-handlers-mapping';
import type { MainClientMessageName } from './main-client-message-name';
import type { RendererClientMessageName } from './renderer-client-message-name';
import { WEB_SOCKET_SERVER_PORT } from './port';
import type { SharedServerMessagePayload } from './shared-server-message-name';
import { SharedServerMessageName } from './shared-server-message-name';
import type { IdentifiableClientMessage } from './identifiable-client-message';
import type { MainServerMessagePayload, MainServerMessageName } from './main-server-message-name';
import { ErrorCode } from '../common/error-code';
import { NetworkError } from '../node/errors/network-error';
import type { RendererServerMessagePayload, RendererServerMessageName } from './renderer-server-message-name';
import type { Handler } from './handler';
import type { GameServerMessageName, GameServerMessagePayload } from './game-server-message-name';
import type { GameClientMessageName, GameClientMessagePayload } from './game-client-message-name';

process.on('uncaughtException', logger.error);
process.on('unhandledRejection', logger.error);

type SendableRendererMessagePayload<MessageName extends RendererServerMessageName> =
  RendererServerMessagePayload[MessageName];
type SendableRendererMessage<MessageName extends RendererServerMessageName = RendererServerMessageName> = {
  name: MessageName;
} & (SendableRendererMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableRendererMessagePayload<MessageName>;
    });

type SendableMainMessagePayload<MessageName extends MainServerMessageName> = MainServerMessagePayload[MessageName];
type SendableMainMessage<MessageName extends MainServerMessageName = MainServerMessageName> = {
  name: MessageName;
} & (SendableMainMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableMainMessagePayload<MessageName>;
    });

type SendableGameMessagePayload<MessageName extends GameServerMessageName> = GameServerMessagePayload[MessageName];
type SendableGameMessage<MessageName extends GameServerMessageName = GameServerMessageName> = {
  name: MessageName;
} & (SendableGameMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableGameMessagePayload<MessageName>;
    });

type SharedMessagePayload<MessageName extends SharedServerMessageName> = SharedServerMessagePayload[MessageName];
type SharedMessage<MessageName extends SharedServerMessageName = SharedServerMessageName> = {
  name: MessageName;
} & (SharedMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SharedMessagePayload<MessageName>;
    });

type GameListener<MessageName extends GameClientMessageName = GameClientMessageName> = (
  payload: GameClientMessagePayload[MessageName],
) => void;

class WebSocketServer {
  private server: WSServer;
  private rendererProcessSocket: WebSocket | null = null;
  private mainProcessSocket: WebSocket | null = null;
  private gameProcessSocket: WebSocket | null = null;
  private gameListeners = new Map<GameClientMessageName, GameListener[]>();
  private gameSocketConnectionTimestamp: number | null = null;

  constructor() {
    this.server = new WSServer({
      port: WEB_SOCKET_SERVER_PORT,
    });

    this.server.on('listening', this.onServerCreated);
    this.server.on('connection', this.onConnection);
    this.server.on('error', this.onError);
    this.server.on('close', this.onClose);
  }

  public sendMessageToRendererProcess = <MessageName extends RendererServerMessageName>(
    message: SendableRendererMessage<MessageName>,
  ): void => {
    if (this.rendererProcessSocket) {
      this.rendererProcessSocket.send(JSON.stringify(message));
    } else {
      logger.warn(`WS:: rendererProcessSocket is null, can't send message to renderer process`);
    }
  };

  public sendMessageToMainProcess = <MessageName extends MainServerMessageName>(
    message: SendableMainMessage<MessageName>,
  ): void => {
    if (this.mainProcessSocket) {
      this.mainProcessSocket.send(JSON.stringify(message));
    } else {
      logger.warn(`WS:: mainProcessSocket is null, can't send message to main process`);
    }
  };

  public sendMessageToGameProcess = <MessageName extends GameServerMessageName>(
    message: SendableGameMessage<MessageName>,
  ): void => {
    if (this.gameProcessSocket) {
      this.gameProcessSocket.send(JSON.stringify(message));
    } else {
      logger.warn(`WS:: gameProcessSocket is null, can't send message to game process`);
    }
  };

  public broadcast = <MessageName extends SharedServerMessageName>(message: SharedMessage<MessageName>): void => {
    for (const client of this.server.clients) {
      client.send(JSON.stringify(message));
    }
  };

  private onServerCreated = () => {
    logger.log(`WS:: server listening on port ${WEB_SOCKET_SERVER_PORT}`);
  };

  private onConnection = (webSocket: WebSocket, request: IncomingMessage): void => {
    if (request.url === undefined) {
      logger.error('WS:: Missing request URL');
      return;
    }

    // Prepend http://localhost to construct a valid URL and parse the query parameters.
    const url = new URL(`http://localhost${request.url}`);
    const processName = url.searchParams.get('process');

    if (processName === 'main') {
      logger.log(`WS:: main process socket connected`);
      this.mainProcessSocket = webSocket;
      this.mainProcessSocket.on('close', this.onMainProcessSocketDisconnect);
      this.mainProcessSocket.on('error', this.onMainProcessSocketError);
      this.mainProcessSocket.on('message', this.onMainProcessSocketMessage);
    } else if (processName === 'renderer') {
      logger.log(`WS:: renderer process socket connected`);
      this.rendererProcessSocket = webSocket;
      this.rendererProcessSocket.on('close', this.onRendererProcessSocketDisconnect);
      this.rendererProcessSocket.on('error', this.onRendererProcessSocketError);
      this.rendererProcessSocket.on('message', this.onRendererProcessSocketMessage);
    } else {
      logger.log(`WS:: game process socket connected`);
      this.gameProcessSocket = webSocket;
      this.gameProcessSocket.on('close', this.onGameProcessSocketDisconnect);
      this.gameProcessSocket.on('error', this.onGameProcessSocketError);
      this.gameProcessSocket.on('message', this.onGameProcessSocketMessage);
      this.gameSocketConnectionTimestamp = Date.now();
    }
  };

  private onRendererProcessSocketMessage = async (data: RawData): Promise<void> => {
    if (this.rendererProcessSocket === null) {
      logger.warn('WS:: renderer process socket not defined');
      return;
    }

    try {
      const message: IdentifiableClientMessage<RendererClientMessageName> = JSON.parse(data.toString());
      const { name, payload, uuid } = message;
      logger.log(`WS:: message with name ${name} and uuid ${uuid} received from renderer process`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler: Handler<any, any> = rendererHandlers[name];
      if (typeof handler === 'function') {
        try {
          const result = await handler(payload);
          this.sendMessageToRendererProcess({
            name: SharedServerMessageName.Reply,
            payload: result,
            uuid,
          } as SendableRendererMessage);
        } catch (error) {
          let payload: ErrorCode | string = ErrorCode.UnknownError;
          if (typeof error === 'string') {
            payload = error;
          } else if (typeof error === 'number') {
            payload = error as ErrorCode;
          }

          if (typeof payload === 'string' || payload === ErrorCode.UnknownError) {
            logger.error(`WS:: error handling message with ${name} from renderer process`);
            logger.error(error);
          }

          this.sendMessageToRendererProcess({
            name: SharedServerMessageName.ReplyError,
            payload,
            uuid,
          } as SendableRendererMessage);
        }
      } else {
        logger.warn(`WS:: unknown message name: ${name}`);
      }
    } catch (error) {
      logger.error('WS:: renderer process request error');
      logger.error(error);
    }
  };

  private onMainProcessSocketMessage = async (data: RawData): Promise<void> => {
    if (this.mainProcessSocket === null) {
      logger.error('WS:: main process socket not defined');
      return;
    }

    try {
      const message: IdentifiableClientMessage<MainClientMessageName> = JSON.parse(data.toString());
      const { name, payload, uuid } = message;
      logger.log(`WS:: message with name ${name} and uuid ${uuid} received from main process`);

      const handler: Handler<unknown, unknown> = mainHandlers[name];
      if (typeof handler === 'function') {
        try {
          const result = await handler(payload);
          this.sendMessageToMainProcess({
            name: SharedServerMessageName.Reply,
            payload: result,
            uuid,
          } as SendableMainMessage);
        } catch (error) {
          let payload: ErrorCode | string = ErrorCode.UnknownError;
          if (typeof error === 'string') {
            payload = error;
          } else if (typeof error === 'number') {
            payload = error as ErrorCode;
          }

          if (typeof payload === 'string' || payload === ErrorCode.UnknownError) {
            logger.error(`WS:: error handling message with ${name} from main process`);
            logger.error(error);
          }

          this.sendMessageToMainProcess({
            name: SharedServerMessageName.ReplyError,
            payload,
            uuid,
          } as SendableMainMessage);
        }
      } else {
        logger.warn(`WS:: unknown message with name: ${name}`);
      }
    } catch (error) {
      logger.error('WS:: main process request error');
      logger.error(error);
    }
  };

  private onRendererProcessSocketDisconnect = (code: number, reason: string): void => {
    logger.log('WS:: renderer process socket disconnected', code, reason);
    this.rendererProcessSocket = null;
  };

  private onRendererProcessSocketError(error: unknown) {
    logger.error('WS:: renderer process socket error', error);
  }

  private onMainProcessSocketError(error: unknown) {
    logger.error('WS:: main process socket error', error);
  }

  private onMainProcessSocketDisconnect = (code: number, reason: string): void => {
    logger.log('WS:: main process socket disconnected', code, reason);
    this.mainProcessSocket = null;
  };

  public addGameMessageListener = <MessageName extends GameClientMessageName>(
    name: MessageName,
    listener: GameListener<MessageName>,
  ) => {
    const listeners = this.gameListeners.get(name);
    if (listeners === undefined) {
      this.gameListeners.set(name, [listener as GameListener]);
    } else {
      listeners.push(listener as GameListener);
    }
  };

  public isGameConnected = () => {
    return this.gameProcessSocket !== null;
  };

  public removeGameEventListeners = (name: GameClientMessageName): void => {
    this.gameListeners.set(name, []);
  };

  private onGameProcessSocketMessage = (data: RawData) => {
    try {
      const message: Omit<IdentifiableClientMessage<GameClientMessageName>, 'uuid'> = JSON.parse(data.toString());
      const { name, payload } = message;
      logger.log(`WS:: message with name ${name} received from game process`);

      const listeners = this.gameListeners.get(name);
      if (listeners) {
        for (const listener of listeners) {
          listener(payload);
        }
      }
    } catch (error) {
      logger.error('WS:: game process request error');
      logger.error(error);
    }
  };

  private onGameProcessSocketDisconnect = (code: number, reason: string): void => {
    logger.log('WS:: game process socket disconnected', code, reason);
    this.gameProcessSocket = null;

    this.gameListeners.clear();
    this.gameSocketConnectionTimestamp = null;
  };

  private onGameProcessSocketError(error: unknown) {
    logger.error('WS:: game process socket error', error);
  }

  private onError = (error: Error) => {
    logger.error('WS:: an error occurred');
    logger.error(error);
  };

  private onClose = () => {
    logger.error('WS:: server closed');
  };
}

// In dev mode (when the WS server is started from the dev window), the DOM fetch API overrides the NodeJS fetch API.
// It allows to see requests in the DevTools only during development.
// ! Sometimes you may have to use explicitly undici (NodeJS fetch) because of differences between DOM/NodeJS APIs.
// ! In this case, you will not see requests from the DevTools.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | globalThis.URL, init?: RequestInit) => {
  try {
    return await originalFetch(input, init);
  } catch (error) {
    // When a network issue occurred when calling fetch(), the error is a TypeError.
    // See fetch API spec: https://fetch.spec.whatwg.org/#fetch-api
    // > If response is a network error, then reject p with a TypeError and terminate these substeps.
    if (error instanceof TypeError) {
      logger.error(`Network error while calling ${input.toString()}`);
      logger.error(error);
      throw new NetworkError();
    }
    throw error;
  }
};

if (IS_DEV) {
  const originalSetTimeout = globalThis.setTimeout;
  // @ts-ignore Undici uses Node Timeout since v6.20.0, we mimic it in dev mode as the server process runs in a
  // BrowserWindow, not in a Node process.
  globalThis.setTimeout = (callback: (...args: unknown[]) => void, ms: number, ...args: unknown[]): NodeJS.Timeout => {
    const wrappedCallback = () => {
      callback.apply(this, args);
    };

    const timeoutId = originalSetTimeout.call(window, wrappedCallback, ms ?? 0);
    const timeout: NodeJS.Timeout = {
      hasRef: () => true,
      ref: () => timeout,
      refresh: () => timeout,
      unref: () => timeout,
      [Symbol.toPrimitive]: () => Number(timeoutId),
      [Symbol.dispose]: () => {
        clearTimeout(timeoutId);
        return timeoutId;
      },
      close: () => {
        clearTimeout(timeoutId);
        return timeout;
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _onTimeout() {},
    };

    return timeout;
  };
}

export const server = new WebSocketServer();

process.on('message', function (message) {
  logger.log('WS:: message from main process', message);
  if (message === 'ping') {
    process.send?.('pong');
  }
});
