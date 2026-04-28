import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidJson extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidJson);
    this.message = 'Invalid JSON';
  }
}
