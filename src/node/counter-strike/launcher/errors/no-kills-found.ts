import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class NoKillsFound extends BaseError {
  public constructor() {
    super(ErrorCode.NoKillsFound);
    this.message = 'No kills found';
  }
}
