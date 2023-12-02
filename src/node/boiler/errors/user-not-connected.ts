import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class UserNotConnected extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerUserNotConnected);
    this.message = 'User not connected';
  }
}
