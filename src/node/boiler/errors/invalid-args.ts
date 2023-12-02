import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidArgs extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerInvalidArgs);
    this.message = 'Invalid arguments';
  }
}
