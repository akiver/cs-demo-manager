import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SteamNotRunning extends BaseError {
  public constructor() {
    super(ErrorCode.SteamNotRunning);
    this.message = 'Steam is not running';
  }
}
