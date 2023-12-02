declare global {
  interface Window {
    crypto: {
      randomUUID: () => string;
    };
  }
}

export {};
