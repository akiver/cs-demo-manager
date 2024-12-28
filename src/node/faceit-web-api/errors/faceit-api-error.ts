import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class FaceitApiError extends BaseError {
  public constructor(httpStatus?: number) {
    super(ErrorCode.FaceItApiError);
    if (httpStatus !== undefined) {
      this.message = `FACEIT API error with HTTP status ${httpStatus}`;
    } else {
      this.message = 'FACEIT API error';
    }
  }
}
