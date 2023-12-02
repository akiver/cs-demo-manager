import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class BoilerUnknownError extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerUnknownError);
    this.message = 'An unknown error occurred while running boiler';
  }
}
