import { ErrorCode } from 'csdm/common/error-code';
import { SteamApiError } from './steamapi-error';

export class SteamTooMayRequests extends SteamApiError {
  public constructor() {
    super();
    this.code = ErrorCode.SteamApiTooManyRequests;
    this.message = 'Steam API returned a 429 status code';
  }
}
