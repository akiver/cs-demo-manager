import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CounterStrikeVideoConfigNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.CounterStrikeVideoConfigNotFound);
    this.message = 'CS video config file not found';
  }
}
