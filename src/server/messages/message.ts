// A WebSocket message: the payload property only exists when the message declares one.
// The tuple wrapper prevents the conditional from distributing over union payloads.
export type Message<MessageName, Payload> = {
  name: MessageName;
} & ([Payload] extends [void]
  ? object
  : {
      payload: Payload;
    });

type HandlerPayload<HandlerFunction> = HandlerFunction extends (...args: infer Args) => unknown ? Args[0] : never;

// A message a client process can send to the WebSocket server, derived from the handlers mapping dedicated to that
// process: the payload type is the first parameter of the handler registered for the message name.
export type SendableMessage<Handlers, MessageName extends keyof Handlers = keyof Handlers> = Message<
  MessageName,
  HandlerPayload<Handlers[MessageName]>
>;
