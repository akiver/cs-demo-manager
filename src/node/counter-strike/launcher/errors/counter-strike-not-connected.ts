import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CounterStrikeNotConnected extends BaseError {
  public constructor() {
    super(ErrorCode.CounterStrikeNotConnected);
    this.message = 'CS is not connected to the WS server';
  }
}
