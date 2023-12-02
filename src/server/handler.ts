type HandlerWithoutPayload<ReturnType> = () => Promise<ReturnType>;
type HandlerWithPayload<Payload, ReturnType> = (payload: Payload) => Promise<ReturnType>;
/**
 * An handler must be a promise that accepts a payload as first parameter and possibly return something.
 *
 * Example:
 *
 * async function myHandler(payload: string) {
 *   // Do something and then send the message to renderer process
 *   const resultPayload = await doSomething();
 *   server.sendMessageToRendererProcess({
 *     name: 'message-to-renderer-process-name',
 *     payload: resultPayload
 *   });
 *
 *   // If the handler returns data, you can await the call to client.send({...}) to get the data.
 *   // const result = await client.send({
 *   //   name: 'message-name-that-trigger-this-handler'
 *   // });
 *   // console.log(result); result will be what's the handler returned.
 *   return result;
 * }
 */
export type Handler<Payload = void, ReturnType = void> = Payload extends void
  ? HandlerWithoutPayload<ReturnType>
  : HandlerWithPayload<Payload, ReturnType>;
