import type { ILogger } from 'csdm/node/logger';

declare global {
  declare const IS_PRODUCTION: boolean;
  declare const IS_DEV: boolean;
  declare const APP_VERSION: string;
  declare const REACT_STRICT_MODE_ENABLED: boolean;
  var logger: ILogger;
}

export {};
