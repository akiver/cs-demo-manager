import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class RenownApiError extends BaseError {
  public constructor(httpStatus?: number) {
    super(ErrorCode.RenownApiError);
    if (httpStatus !== undefined) {
      this.message = `Renown API error with HTTP status ${httpStatus}`;
    } else {
      this.message = 'Renown API error';
    }
  }
}
