import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidDemoName extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidDemoName);
    this.message = 'Invalid demo name';
  }
}
