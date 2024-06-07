import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import type { MainServerMessageName, MainServerMessagePayload } from 'csdm/server/main-server-message-name';
import type { MainClientMessageName } from 'csdm/server/main-client-message-name';
import { WEB_SOCKET_SERVER_PORT } from 'csdm/server/port';
import type { IdentifiableClientMessage } from 'csdm/server/identifiable-client-message';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';
import type { MainMessageHandlers } from 'csdm/server/handlers/main-handlers-mapping';

type Listener<MessageName extends MainServerMessageName = MainServerMessageName> = (
  client: WebSocketClient,
  payload: MainServerMessagePayload[MessageName],
) => void;
type Resolver<MessageName extends MainServerMessageName = MainServerMessageName> = (
  payload: MainServerMessagePayload[MessageName],
) => void;
type ReplyHandler<MessageName extends MainServerMessageName = MainServerMessageName> = {
  resolve: Resolver<MessageName>;
  reject: (error: unknown) => void;
};

type SendableMessagePayload<MessageName extends MainClientMessageName> = Parameters<
  MainMessageHandlers[MessageName]
>[0];
type SendableMessage<MessageName extends MainClientMessageName = MainClientMessageName> = {
  name: MessageName;
} & (SendableMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableMessagePayload<MessageName>;
    });

export class WebSocketClient {
  private messageQueue: SendableMessage[] = [];
  private listeners: Map<MainServerMessageName, Listener[]> = new Map();
  private replyHandlers: Map<string, ReplyHandler> = new Map();
  private socket!: WebSocket;
  public isConnected: boolean = false;

  public constructor() {
    this.connect();
  }

  public on<MessageName extends MainServerMessageName>(name: MessageName, listener: Listener<MessageName>): void {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      this.listeners.set(name, [listener as Listener]);
    } else {
      listeners.push(listener as Listener);
    }
  }

  public off<MessageName extends MainServerMessageName>(name: MessageName, listener: Listener<MessageName>): void {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      return;
    }

    this.listeners.set(
      name,
      listeners.filter((cb) => cb !== listener),
    );
  }

  public removeAllEventListeners(name: MainServerMessageName): void {
    this.listeners.set(name, []);
  }

  /**
   * Send a message to the WebSocket server.
   * The promise will be resolved when the reply handler is called, i.e. when this client receives the response.
   *
   * You can wait for the response result like this:
   *   const result = await client.send({ name: 'message-name' });
   *   console.log(result);
   * Or you may don't wait the response and use listeners instead:
   *   const onMessage = (result) => {
   *     console.log(result);
   *     client.off('message-name', onMessage);
   *   }
   *   client.on('message-name', onMessage);
   *   client.send({ name: 'message-name' });
   */
  public send<MessageName extends MainClientMessageName>(message: SendableMessage<MessageName>) {
    return new Promise((resolve: Resolver, reject) => {
      const uuid = randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      this.replyHandlers.set(uuid, { resolve, reject });
      if (this.isConnected) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message);
      }
    }) as ReturnType<MainMessageHandlers[MessageName]>;
  }

  private connect = () => {
    logger.log('WS:: connecting to server');
    const url = `ws://localhost:${WEB_SOCKET_SERVER_PORT}?process=main`;
    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', this.onConnect);
    this.socket.addEventListener('error', this.onDisconnect);
  };

  private onConnect = (): void => {
    logger.log('WS:: connected');
    this.isConnected = true;
    this.socket.addEventListener('message', this.onMessage);
    this.socket.addEventListener('close', this.onDisconnect);
    this.socket.addEventListener('error', this.onError);
    for (const message of this.messageQueue) {
      this.send(message);
    }
    this.messageQueue = [];
  };

  private onDisconnect = (): void => {
    logger.warn('WS:: disconnected');
    this.isConnected = false;
    this.connect();
  };

  private onError = (event: WebSocket.ErrorEvent): void => {
    logger.error('WS:: error', event);
    this.isConnected = false;
  };

  private onMessage = (messageEvent: WebSocket.MessageEvent): void => {
    try {
      const message: IdentifiableClientMessage<MainServerMessageName> = JSON.parse(messageEvent.data as string);
      const { name, payload, uuid } = message;

      switch (name) {
        case SharedServerMessageName.Reply:
          {
            if (uuid === undefined) {
              logger.log(`WS:: missing uuid for message with name: "${name}", can't retrieve its reply handler`);
              return;
            }
            const replyHandler = this.replyHandlers.get(uuid);
            if (replyHandler) {
              replyHandler.resolve(payload);
              this.replyHandlers.delete(uuid);
            } else {
              logger.log(`WS:: no reply handler for message with name: "${name}" and uuid ${uuid}`);
            }
          }
          break;
        case SharedServerMessageName.ReplyError:
          {
            if (uuid === undefined) {
              logger.log(`WS:: missing uuid for message with name: "${name}", can't retrieve its reply handler`);
              return;
            }

            const replyHandler = this.replyHandlers.get(uuid);
            if (replyHandler) {
              replyHandler.reject(payload);
              this.replyHandlers.delete(uuid);
            } else {
              logger.log(`WS:: no reply handler for message with name: "${name}" and uuid ${uuid}`);
            }
          }
          break;
        default: {
          logger.log(`WS:: message "${name}" received from server`);
          const listeners = this.listeners.get(name);
          if (listeners) {
            for (const listener of listeners) {
              listener(this, payload);
            }
          } else {
            logger.log(`WS:: no listener for message with name: "${name}"`);
          }
        }
      }
    } catch (error) {
      logger.error('WS:: Error on message:');
      logger.error(error);
    }
  };
}
