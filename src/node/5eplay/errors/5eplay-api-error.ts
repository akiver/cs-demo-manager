import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class FiveEPlayApiError extends BaseError {
  public constructor(httpStatus?: number) {
    super(ErrorCode.FiveEPlayApiError);
    if (httpStatus !== undefined) {
      this.message = `5EPlay API error with HTTP status ${httpStatus}`;
    } else {
      this.message = '5EPlay API error';
    }
  }
}
