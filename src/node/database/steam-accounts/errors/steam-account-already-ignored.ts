import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SteamAccountAlreadyIgnored extends BaseError {
  public constructor() {
    super(ErrorCode.SteamAccountAlreadyIgnored);
    this.message = 'Steam account is already ignored';
  }
}
