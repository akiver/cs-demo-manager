export class AbortError extends Error {
  constructor() {
    super();
    this.name = 'AbortError';
  }
}

export const abortError = new AbortError();

export function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw abortError;
  }
}
