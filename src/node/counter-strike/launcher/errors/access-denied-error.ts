import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class AccessDeniedError extends BaseError {
  public constructor() {
    super(ErrorCode.AccessDenied);
    this.message = 'Access denied';
  }
}
