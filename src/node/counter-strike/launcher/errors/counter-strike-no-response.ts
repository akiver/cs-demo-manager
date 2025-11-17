import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CounterStrikeNoResponse extends BaseError {
  public constructor() {
    super(ErrorCode.CounterStrikeNoResponse);
    this.message = 'CS has not responded to the WS message';
  }
}
