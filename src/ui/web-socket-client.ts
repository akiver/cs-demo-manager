import type { RendererMessageHandlers } from 'csdm/server/handlers/renderer-handlers-mapping';
import type { IdentifiableClientMessage } from 'csdm/server/identifiable-client-message';
import { WEB_SOCKET_SERVER_PORT } from 'csdm/server/port';
import type { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { RendererServerMessagePayload, RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';

type Listener<MessageName extends RendererServerMessageName = RendererServerMessageName> = (
  payload: RendererServerMessagePayload[MessageName],
) => void;

type ReplyHandler = {
  resolve: Listener;
  reject: (error: unknown) => void;
};

type SendableMessagePayload<MessageName extends RendererClientMessageName> = Parameters<
  RendererMessageHandlers[MessageName]
>[0];

type SendableMessage<MessageName extends RendererClientMessageName = RendererClientMessageName> = {
  name: MessageName;
} & (SendableMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableMessagePayload<MessageName>;
    });

export class WebSocketClient {
  private messageQueue: SendableMessage[] = [];
  private listeners = new Map<RendererServerMessageName, Listener[]>();
  private replyHandlers: Map<string, ReplyHandler> = new Map();
  private socket!: WebSocket;
  private isConnected: boolean = false;
  private onConnectionSuccess: () => void;
  private onConnectionError: (event: CloseEvent) => void;

  public constructor(onConnectionSuccess: () => void, onConnectionError: (event: CloseEvent) => void) {
    this.onConnectionError = onConnectionError;
    this.onConnectionSuccess = onConnectionSuccess;
    this.connect();
  }

  public on = <MessageName extends RendererServerMessageName>(name: MessageName, listener: Listener<MessageName>) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      this.listeners.set(name, [listener as Listener]);
    } else {
      listeners.push(listener as Listener);
    }
  };

  public off = <MessageName extends RendererServerMessageName>(name: MessageName, listener: Listener<MessageName>) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      return;
    }

    this.listeners.set(
      name,
      listeners.filter((cb: Listener) => cb !== listener),
    );
  };

  public removeAllEventListeners = (name: RendererServerMessageName): void => {
    this.listeners.set(name, []);
  };

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
  public send = <MessageName extends RendererClientMessageName>(message: SendableMessage<MessageName>) => {
    return new Promise((resolve: Listener, reject) => {
      const uuid = window.crypto.randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      this.replyHandlers.set(uuid, { resolve, reject });
      if (this.isConnected) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message as unknown as SendableMessage);
      }
    }) as ReturnType<RendererMessageHandlers[MessageName]>;
  };

  private connect = () => {
    logger.log('WS:: connecting to server');
    const url = `ws://localhost:${WEB_SOCKET_SERVER_PORT}?process=renderer`;
    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', this.onConnect);
    this.socket.addEventListener('close', this.onDisconnect);
  };

  private onConnect = (): void => {
    logger.log('WS:: connected');
    this.isConnected = true;
    this.socket.addEventListener('message', this.onMessage);
    this.socket.addEventListener('close', this.onDisconnect);
    this.socket.addEventListener('error', this.onError);
    this.onConnectionSuccess();
    for (const message of this.messageQueue) {
      this.send(message);
    }
    this.messageQueue = [];
  };

  private onDisconnect = (event: CloseEvent): void => {
    logger.warn('WS:: disconnected');
    this.isConnected = false;
    this.onConnectionError(event);
    this.connect();
  };

  private onError = (event: Event): void => {
    logger.error('WS:: error', event);
    this.isConnected = false;
    this.connect();
  };

  private onMessage = (messageEvent: MessageEvent): void => {
    try {
      const message: IdentifiableClientMessage<RendererServerMessageName> = JSON.parse(messageEvent.data as string);
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
          logger.log(`WS:: message with name "${name}" received from server`);
          const listeners = this.listeners.get(name);
          if (listeners) {
            for (const listener of listeners) {
              listener(payload);
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
