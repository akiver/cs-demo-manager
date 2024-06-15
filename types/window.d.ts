/// <reference types="navigation-api-types" />

declare global {
  interface Window {
    crypto: {
      randomUUID: () => string;
    };
  }
}

export {};
