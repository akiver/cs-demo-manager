import type { RendererMessageHandlers } from 'csdm/server/handlers/renderer-handlers-mapping';
import type { IdentifiableClientMessage } from 'csdm/server/messages/identifiable-client-message';
import type { RendererClientMessageName } from 'csdm/server/messages/renderer-client-message-name';
import type { ServerPushListener, ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { SendableMessage } from 'csdm/server/messages/message';
import { SharedServerMessageName } from 'csdm/server/messages/shared-server-message-name';

type ReplyHandler = {
  resolve: (payload: unknown) => void;
  reject: (error: unknown) => void;
};

export class WebSocketClient {
  private messageQueue: SendableMessage<RendererMessageHandlers>[] = [];
  private listeners = new Map<ServerPushMessageName, ServerPushListener[]>();
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

  public on = <MessageName extends ServerPushMessageName>(
    name: MessageName,
    listener: ServerPushListener<MessageName>,
  ) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      this.listeners.set(name, [listener as ServerPushListener]);
    } else {
      listeners.push(listener as ServerPushListener);
    }
  };

  public off = <MessageName extends ServerPushMessageName>(
    name: MessageName,
    listener: ServerPushListener<MessageName>,
  ) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      return;
    }

    this.listeners.set(
      name,
      listeners.filter((cb) => cb !== listener),
    );
  };

  public removeAllEventListeners = (name: ServerPushMessageName): void => {
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
  public send = <MessageName extends RendererClientMessageName>(
    message: SendableMessage<RendererMessageHandlers, MessageName>,
  ) => {
    return new Promise((resolve: (payload: unknown) => void, reject) => {
      const uuid = window.crypto.randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      this.replyHandlers.set(uuid, { resolve, reject });
      if (this.isConnected) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message as SendableMessage<RendererMessageHandlers>);
      }
    }) as ReturnType<RendererMessageHandlers[MessageName]>;
  };

  private connect = () => {
    logger.log('WS:: connecting to server');
    const url = `ws://localhost:${window.csdm.WEB_SOCKET_SERVER_PORT}?process=renderer`;
    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', this.onConnect);
    this.socket.addEventListener('close', this.onDisconnect);
  };

  private onConnect = async () => {
    logger.log('WS:: connected');
    this.isConnected = true;
    this.socket.addEventListener('message', this.onMessage);
    this.socket.addEventListener('close', this.onDisconnect);
    this.socket.addEventListener('error', this.onError);
    this.onConnectionSuccess();
    for (const message of this.messageQueue) {
      await this.send(message);
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
      const message: IdentifiableClientMessage<ServerPushMessageName> = JSON.parse(messageEvent.data as string);
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
