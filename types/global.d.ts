import type { ILogger } from 'csdm/node/logger';

declare global {
  const IS_PRODUCTION: boolean;
  const IS_DEV: boolean;
  const APP_VERSION: string;
  const REACT_STRICT_MODE_ENABLED: boolean;
  var logger: ILogger;
}

export {};
