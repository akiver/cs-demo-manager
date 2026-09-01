import type { RawData } from 'ws';
import type WebSocket from 'ws';
import { WebSocketServer as WSServer } from 'ws';
import type { IncomingMessage } from 'node:http';
import { URL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { rendererHandlers } from 'csdm/server/handlers/renderer-handlers-mapping';
import { mainHandlers } from 'csdm/server/handlers/main-handlers-mapping';
import { cliHandlers, probeHandlers } from 'csdm/server/handlers/cli-handlers-mapping';
import type { MainClientMessageName } from 'csdm/server/messages/main-client-message-name';
import { getWebSocketServerPort, WEB_SOCKET_SERVER_PORT_ENV_NAME } from './port';
import type { SharedServerMessagePayload } from 'csdm/server/messages/shared-server-message-name';
import { SharedServerMessageName } from 'csdm/server/messages/shared-server-message-name';
import type { IdentifiableClientMessage } from 'csdm/server/messages/identifiable-client-message';
import type {
  MainServerMessagePayload,
  MainServerMessageName,
  MainServerMessageResponse,
} from 'csdm/server/messages/main-server-message-name';
import { ErrorCode } from '../common/error-code';
import { probeDaemon } from 'csdm/node/daemon/probe-daemon';
import type { ServerPushMessagePayload, ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { Handler, HandlerContext } from 'csdm/server/messages/handler';
import { videoQueue } from 'csdm/server/video-queue';
import { analysesListener } from 'csdm/server/analyses-listener';
import type { GameServerMessageName, GameServerMessagePayload } from 'csdm/server/messages/game-server-message-name';
import type { GameClientMessageName, GameClientMessagePayload } from 'csdm/server/messages/game-client-message-name';
import type { Message } from 'csdm/server/messages/message';

type SendablePushMessage<MessageName extends ServerPushMessageName = ServerPushMessageName> = Message<
  MessageName,
  ServerPushMessagePayload[MessageName]
>;

type SendableMainMessage<MessageName extends MainServerMessageName = MainServerMessageName> = Message<
  MessageName,
  MainServerMessagePayload[MessageName]
>;

export type SendableGameMessage<MessageName extends GameServerMessageName = GameServerMessageName> = Message<
  MessageName,
  GameServerMessagePayload[MessageName]
>;

type SharedMessage<MessageName extends SharedServerMessageName = SharedServerMessageName> = Message<
  MessageName,
  SharedServerMessagePayload[MessageName]
>;

export type GameListener<MessageName extends GameClientMessageName = GameClientMessageName> = (
  payload: GameClientMessagePayload[MessageName],
) => void;

type MainReplyHandler<T = unknown> = {
  resolve: (payload: T) => void;
  reject: (error: unknown) => void;
};

class WebSocketServer {
  private server: WSServer | null = null;
  private rendererProcessSocket: WebSocket | null = null;
  private mainProcessSocket: WebSocket | null = null;
  private gameProcessSocket: WebSocket | null = null;
  private cliSockets = new Set<WebSocket>();
  private gameListeners = new Map<GameClientMessageName, GameListener[]>();
  private mainReplyHandlers = new Map<string, MainReplyHandler>();

  // ! The server doesn't bind its port at construction on purpose: many modules import the singleton below only to
  // send messages, importing this file must not have side effects. Only the daemon entry point calls listen().
  public listen = (): Promise<number> => {
    return new Promise((resolve) => {
      this.createServer(getWebSocketServerPort(), resolve);
    });
  };

  private createServer(port: number, onListening: (port: number) => void) {
    this.server = new WSServer({
      port,
    });

    this.server.on('listening', () => {
      const boundPort = this.getBoundPort();
      // Expose the actual port through the environment variable so getWebSocketServerPort() is correct everywhere in
      // the daemon process, notably when injecting CSDM_WS_PORT into the game process environment.
      process.env[WEB_SOCKET_SERVER_PORT_ENV_NAME] = String(boundPort);
      logger.debug(`WS:: server listening on port ${boundPort}`);
      onListening(boundPort);
    });
    this.server.on('connection', this.onConnection);
    this.server.on('error', (error: Error) => {
      this.onError(error, port, onListening);
    });
    this.server.on('close', this.onClose);
  }

  public getBoundPort(): number {
    const address = this.server?.address();
    if (address === null || address === undefined || typeof address === 'string') {
      throw new Error('The WebSocket server is not listening');
    }

    return address.port;
  }

  public getClientCount(): number {
    let count = this.cliSockets.size;
    for (const socket of [this.rendererProcessSocket, this.mainProcessSocket, this.gameProcessSocket]) {
      if (socket !== null) {
        count++;
      }
    }

    return count;
  }

  public sendPushMessage = <MessageName extends ServerPushMessageName>(
    message: SendablePushMessage<MessageName>,
  ): void => {
    const json = JSON.stringify(message);
    for (const socket of this.cliSockets) {
      socket.send(json);
    }

    if (this.rendererProcessSocket) {
      this.rendererProcessSocket.send(json);
    } else if (this.cliSockets.size === 0) {
      logger.warn(`WS:: no renderer or CLI client connected, the push message ${message.name} has been dropped`);
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

  public sendToMainAndWaitForReply = <MessageName extends MainServerMessageName>(
    message: SendableMainMessage<MessageName>,
  ): Promise<MessageName extends keyof MainServerMessageResponse ? MainServerMessageResponse[MessageName] : void> => {
    return new Promise((resolve, reject) => {
      if (!this.mainProcessSocket) {
        return reject(new Error('Main process socket is not connected'));
      }

      const uuid = randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      this.mainReplyHandlers.set(uuid, {
        resolve: resolve as (payload: unknown) => void,
        reject,
      });
      this.mainProcessSocket.send(JSON.stringify(message));
    });
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
    if (this.server === null) {
      return;
    }

    for (const client of this.server.clients) {
      client.send(JSON.stringify(message));
    }
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
      logger.debug(`WS:: main process socket connected`);
      this.mainProcessSocket = webSocket;
      this.mainProcessSocket.on('close', this.onMainProcessSocketDisconnect);
      this.mainProcessSocket.on('error', this.onMainProcessSocketError);
      this.mainProcessSocket.on('message', this.onMainProcessSocketMessage);
    } else if (processName === 'renderer') {
      logger.debug(`WS:: renderer process socket connected`);
      this.rendererProcessSocket = webSocket;
      this.rendererProcessSocket.on('close', this.onRendererProcessSocketDisconnect);
      this.rendererProcessSocket.on('error', this.onRendererProcessSocketError);
      this.rendererProcessSocket.on('message', this.onRendererProcessSocketMessage);
    } else if (processName === 'cli') {
      const clientId = randomUUID();
      logger.debug(`WS:: CLI process socket connected`);
      this.cliSockets.add(webSocket);
      webSocket.on('close', (code: number, reason: Buffer) => {
        logger.debug('WS:: CLI process socket disconnected', code, reason.toString());
        this.cliSockets.delete(webSocket);
        // The CLI process may die without a chance to clean up after itself, cancel the videos or analyses
        // it queued.
        videoQueue.removeVideosAddedByClient(clientId);
        analysesListener.removeDemosAddedByClient(clientId);
      });
      webSocket.on('error', (error: unknown) => {
        logger.error('WS:: CLI process socket error', error);
      });
      webSocket.on('message', async (data: RawData) => {
        await this.onClientProcessSocketMessage(webSocket, cliHandlers, data, 'CLI', { clientId });
      });
    } else if (processName === 'probe') {
      // Probe sockets are short-lived connections used to detect if a healthy daemon is listening on a port.
      // They are not counted as clients and can only ask for the daemon status.
      webSocket.on('error', (error: unknown) => {
        logger.debug('WS:: probe socket error', error);
      });
      webSocket.on('message', async (data: RawData) => {
        await this.onClientProcessSocketMessage(webSocket, probeHandlers, data, 'probe');
      });
    } else {
      logger.debug(`WS:: game process socket connected`);
      this.gameProcessSocket = webSocket;
      this.gameProcessSocket.on('close', this.onGameProcessSocketDisconnect);
      this.gameProcessSocket.on('error', this.onGameProcessSocketError);
      this.gameProcessSocket.on('message', this.onGameProcessSocketMessage);
    }
  };

  private onClientProcessSocketMessage = async (
    socket: WebSocket,
    handlers: object,
    data: RawData,
    clientName: string,
    context?: HandlerContext,
  ): Promise<void> => {
    try {
      // oxlint-disable-next-line typescript/no-base-to-string
      const message: IdentifiableClientMessage<string> = JSON.parse(data.toString());
      logger.log(`WS:: message with name ${message.name} and uuid ${message.uuid} received from ${clientName} process`);
      await this.dispatchMessageToHandlers(socket, handlers, message, context);
    } catch (error) {
      logger.error(`WS:: ${clientName} process request error`);
      logger.error(error);
    }
  };

  private dispatchMessageToHandlers = async (
    socket: WebSocket,
    handlers: object,
    { name, payload, uuid }: IdentifiableClientMessage<string>,
    context?: HandlerContext,
  ): Promise<void> => {
    // oxlint-disable-next-line typescript/no-explicit-any
    const handler = (handlers as Record<string, Handler<any, any> | undefined>)[name];
    if (typeof handler !== 'function') {
      logger.warn(`WS:: unknown message name: ${name}`);
      return;
    }

    try {
      const result = await handler(payload, context);
      socket.send(
        JSON.stringify({
          name: SharedServerMessageName.Reply,
          payload: result,
          uuid,
        }),
      );
    } catch (error) {
      let errorPayload: ErrorCode | string = ErrorCode.UnknownError;
      if (typeof error === 'string') {
        errorPayload = error;
      } else if (typeof error === 'number') {
        errorPayload = error as ErrorCode;
      }

      if (typeof errorPayload === 'string' || errorPayload === ErrorCode.UnknownError) {
        logger.error(`WS:: error handling message with name ${name}`);
        logger.error(error);
      }

      socket.send(
        JSON.stringify({
          name: SharedServerMessageName.ReplyError,
          payload: errorPayload,
          uuid,
        }),
      );
    }
  };

  private onRendererProcessSocketMessage = async (data: RawData): Promise<void> => {
    if (this.rendererProcessSocket === null) {
      logger.warn('WS:: renderer process socket not defined');
      return;
    }

    await this.onClientProcessSocketMessage(this.rendererProcessSocket, rendererHandlers, data, 'renderer');
  };

  private onMainProcessSocketMessage = async (data: RawData): Promise<void> => {
    if (this.mainProcessSocket === null) {
      logger.error('WS:: main process socket not defined');
      return;
    }

    try {
      const message: IdentifiableClientMessage<MainClientMessageName | SharedServerMessageName> = JSON.parse(
        // oxlint-disable-next-line typescript/no-base-to-string
        data.toString(),
      );
      const { name, payload, uuid } = message;
      logger.log(`WS:: message with name ${name} and uuid ${uuid} received from main process`);

      switch (name) {
        case SharedServerMessageName.Reply: {
          const replyHandler = this.mainReplyHandlers.get(uuid);
          if (replyHandler) {
            replyHandler.resolve(payload);
            this.mainReplyHandlers.delete(uuid);
          } else {
            logger.log(`WS:: no reply handler for Reply message with uuid ${uuid}`);
          }
          break;
        }
        case SharedServerMessageName.ReplyError: {
          const replyHandler = this.mainReplyHandlers.get(uuid);
          if (replyHandler) {
            replyHandler.reject(payload);
            this.mainReplyHandlers.delete(uuid);
          } else {
            logger.log(`WS:: no reply handler for ReplyError message with uuid ${uuid}`);
          }
          break;
        }
        default: {
          await this.dispatchMessageToHandlers(this.mainProcessSocket, mainHandlers, message);
        }
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

  private onRendererProcessSocketError = (error: unknown) => {
    logger.error('WS:: renderer process socket error', error);
  };

  private onMainProcessSocketError = (error: unknown) => {
    logger.error('WS:: main process socket error', error);
  };

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
      // oxlint-disable-next-line typescript/no-base-to-string
      const message: Omit<IdentifiableClientMessage<GameClientMessageName>, 'uuid'> = JSON.parse(data.toString());
      const { name, payload } = message;
      logger.debug(`WS:: message with name ${name} received from game process`);

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
    logger.debug('WS:: game process socket disconnected', code, reason);
    this.gameProcessSocket = null;

    this.gameListeners.clear();
  };

  private onGameProcessSocketError = (error: unknown) => {
    logger.error('WS:: game process socket error', error);
  };

  private onError = (error: Error, port: number, onListening: (port: number) => void) => {
    if ('code' in error && error.code === 'EADDRINUSE') {
      void this.handlePortAlreadyInUse(port, onListening);
      return;
    }

    logger.error('WS:: an error occurred');
    logger.error(error);
  };

  private async handlePortAlreadyInUse(port: number, onListening: (port: number) => void) {
    this.server?.close();

    const status = await probeDaemon(port);
    if (status !== null && status.isDev === IS_DEV) {
      // Another daemon is already listening on this port, typically because two processes spawned a daemon at the same
      // time. The process that spawned this daemon will discover the other one through the daemon info file.
      logger.log(`WS:: a daemon is already listening on port ${port}, exiting`);
      process.exit(0);
    }

    // The port is used by a daemon of the other flavor (dev/production daemons use separate discovery files, so the
    // spawner would never find it) or by an unrelated application, let the OS pick a free port.
    // Clients discover the actual port through the daemon info file.
    logger.warn(`WS:: port ${port} is used by another application, falling back to a random port`);
    this.createServer(0, onListening);
  }

  private onClose = () => {
    logger.error('WS:: server closed');
  };
}

export const server = new WebSocketServer();
