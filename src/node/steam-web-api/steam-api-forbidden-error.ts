import { ErrorCode } from 'csdm/common/error-code';
import { SteamApiError } from './steamapi-error';

export class SteamApiForbiddenError extends SteamApiError {
  public constructor() {
    super();
    this.code = ErrorCode.SteamApiForbidden;
    this.message = 'Steam API returned a 403 status code';
  }
}
