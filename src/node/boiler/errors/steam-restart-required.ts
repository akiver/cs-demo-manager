import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SteamRestartRequired extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerSteamRestartRequired);
    this.message = 'Steam restart required';
  }
}
