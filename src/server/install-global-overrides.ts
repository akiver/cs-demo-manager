import { NetworkError } from 'csdm/node/errors/network-error';

// Wrap the fetch API to translate network failures into a NetworkError.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | globalThis.URL, init?: RequestInit) => {
  if (IS_DEV) {
    // Ask for uncompressed responses to make their body readable from the DevTools Network tab: the Node.js network
    // inspection reports the bytes received on the wire without decoding the Content-Encoding header.
    const headers = new Headers(init?.headers);
    headers.set('accept-encoding', 'identity');
    init = { ...init, headers };
  }

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
