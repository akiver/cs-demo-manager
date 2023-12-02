import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidHlaeExecutable extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidHlaeExecutable);
    this.message = 'Invalid HLAE executable';
  }
}
