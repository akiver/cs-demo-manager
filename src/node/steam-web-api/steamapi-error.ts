import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SteamApiError extends BaseError {
  public constructor() {
    super(ErrorCode.SteamApiError);
    this.message = 'Steam API error';
  }
}
