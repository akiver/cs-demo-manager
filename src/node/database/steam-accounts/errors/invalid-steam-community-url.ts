import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidSteamCommunityUrl extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidSteamCommunityUrl);
    this.message = 'Invalid Steam community URL';
  }
}
