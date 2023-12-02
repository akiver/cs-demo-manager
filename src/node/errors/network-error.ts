import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class NetworkError extends BaseError {
  public constructor() {
    super(ErrorCode.NetworkError);
    this.message = 'Network error';
  }
}
