import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class BoilerSteamNotRunning extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerSteamNotRunningOrLoggedIn);
    this.message = 'Steam not running or logged in';
  }
}
