import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CounterStrikeNotRunning extends BaseError {
  public constructor() {
    super(ErrorCode.CounterStrikeNotRunning);
    this.message = 'CS is not running';
  }
}
