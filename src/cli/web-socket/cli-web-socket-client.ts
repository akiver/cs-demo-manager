import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import type { ServerPushListener, ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import type { CliClientMessageName } from 'csdm/server/messages/cli-client-message-name';
import type { CliMessageHandlers } from 'csdm/server/handlers/cli-handlers-mapping';
import type { IdentifiableClientMessage } from 'csdm/server/messages/identifiable-client-message';
import type { SendableMessage } from 'csdm/server/messages/message';
import { SharedServerMessageName } from 'csdm/server/messages/shared-server-message-name';

type ReplyHandler = {
  resolve: (payload: unknown) => void;
  reject: (error: unknown) => void;
  timeoutId: NodeJS.Timeout;
};

export class CliWebSocketClient {
  private listeners: Map<ServerPushMessageName, ServerPushListener[]> = new Map();
  private replyHandlers: Map<string, ReplyHandler> = new Map();
  private readonly socket: WebSocket;
  private isConnected = true;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    this.socket.on('message', this.onMessage);
    this.socket.on('close', this.onClose);
    this.socket.on('error', this.onError);
  }

  public static connect(port: number): Promise<CliWebSocketClient> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://localhost:${port}?process=cli`);
      const onOpenError = (error: Error) => {
        reject(error);
      };
      socket.once('error', onOpenError);
      socket.once('open', () => {
        socket.off('error', onOpenError);
        resolve(new CliWebSocketClient(socket));
      });
    });
  }

  public on<MessageName extends ServerPushMessageName>(
    name: MessageName,
    listener: ServerPushListener<MessageName>,
  ): void {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      this.listeners.set(name, [listener as ServerPushListener]);
    } else {
      listeners.push(listener as ServerPushListener);
    }
  }

  public off<MessageName extends ServerPushMessageName>(
    name: MessageName,
    listener: ServerPushListener<MessageName>,
  ): void {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      return;
    }

    this.listeners.set(
      name,
      listeners.filter((cb) => cb !== listener),
    );
  }

  /**
   * Send a message to the daemon and resolve with its response.
   * The promise is rejected if the daemon didn't answer within the timeout or if the connection has been closed.
   */
  public send<MessageName extends CliClientMessageName>(
    message: SendableMessage<CliMessageHandlers, MessageName>,
    { timeoutMs = 3_000 }: { timeoutMs?: number } = {},
  ) {
    return new Promise((resolve: (payload: unknown) => void, reject) => {
      if (!this.isConnected) {
        return reject(new Error('The connection to the daemon has been closed'));
      }

      const uuid = randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      const timeoutId = setTimeout(() => {
        this.replyHandlers.delete(uuid);
        reject(new Error(`The daemon didn't answer to the message ${message.name} within ${timeoutMs / 1000}s`));
      }, timeoutMs);
      this.replyHandlers.set(uuid, { resolve, reject, timeoutId });
      this.socket.send(JSON.stringify(message));
    }) as ReturnType<CliMessageHandlers[MessageName]>;
  }

  public close() {
    this.socket.removeAllListeners();
    this.socket.close();
    this.isConnected = false;
  }

  private onClose = () => {
    this.isConnected = false;
    const error = new Error('The connection to the daemon has been closed');
    for (const { reject, timeoutId } of this.replyHandlers.values()) {
      clearTimeout(timeoutId);
      reject(error);
    }
    this.replyHandlers.clear();
  };

  private onError = (error: Error) => {
    logger.error('WS:: error');
    logger.error(error);
  };

  private onMessage = (data: WebSocket.RawData) => {
    try {
      // oxlint-disable-next-line typescript/no-base-to-string
      const message: IdentifiableClientMessage<ServerPushMessageName> = JSON.parse(data.toString());
      const { name, payload, uuid } = message;

      switch (name) {
        case SharedServerMessageName.Reply:
        case SharedServerMessageName.ReplyError: {
          const replyHandler = this.replyHandlers.get(uuid);
          if (replyHandler === undefined) {
            // The reply handler timed out or the reply doesn't belong to this client.
            return;
          }

          clearTimeout(replyHandler.timeoutId);
          this.replyHandlers.delete(uuid);
          if (name === SharedServerMessageName.Reply) {
            replyHandler.resolve(payload);
          } else {
            replyHandler.reject(payload);
          }
          break;
        }
        default: {
          const listeners = this.listeners.get(name);
          if (listeners) {
            for (const listener of listeners) {
              listener(payload);
            }
          }
        }
      }
    } catch (error) {
      logger.error('WS:: Error on message:');
      logger.error(error);
    }
  };
}
