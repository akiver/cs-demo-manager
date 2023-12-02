import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SteamAccountNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.SteamAccountNotFound);
    this.message = 'Steam account not found';
  }
}
