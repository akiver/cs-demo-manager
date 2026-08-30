import { NetworkError } from 'csdm/node/errors/network-error';

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
      logger.error('Network error while calling:');
      logger.error(input);
      logger.error(error);
      throw new NetworkError();
    }
    throw error;
  }
};

if (typeof window !== 'undefined') {
  function createNodeTimeout(
    id: ReturnType<typeof globalThis.setTimeout>,
    clearFn: (id: ReturnType<typeof globalThis.setTimeout>) => void,
  ): NodeJS.Timeout {
    const timeout: NodeJS.Timeout = {
      hasRef: () => true,
      ref: () => timeout,
      refresh: () => timeout,
      unref: () => timeout,
      [Symbol.toPrimitive]: () => Number(id),
      [Symbol.dispose]: () => {
        clearFn(id);
        return id;
      },
      close: () => {
        clearFn(id);
        return timeout;
      },
      _onTimeout() {},
    };
    return timeout;
  }

  const originalSetTimeout = globalThis.setTimeout;
  // @ts-ignore Undici uses Node Timeout since v6.20.0, we mimic it in dev mode as the server process runs in a
  // BrowserWindow, not in a Node process.
  globalThis.setTimeout = (callback: (...args: unknown[]) => void, ms: number, ...args: unknown[]): NodeJS.Timeout => {
    const id = originalSetTimeout.call(window, () => callback.apply(this, args), ms ?? 0);
    return createNodeTimeout(id, clearTimeout);
  };

  const originalSetInterval = globalThis.setInterval;
  // @ts-ignore Undici uses Node SetInterval since v8.0.0, we mimic it in dev mode as the server process runs in a
  // BrowserWindow, not in a Node process.
  globalThis.setInterval = <TArgs extends unknown[]>(
    callback: (...args: TArgs) => void,
    ms?: number,
    ...args: TArgs
  ): NodeJS.Timeout => {
    const id = originalSetInterval.call(window, () => callback.apply(this, args), ms ?? 0);
    return createNodeTimeout(id, clearInterval);
  };
}
