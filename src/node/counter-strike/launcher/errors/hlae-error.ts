import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class HlaeError extends BaseError {
  public constructor() {
    super(ErrorCode.HlaeError);
    this.message = 'HLAE error';
  }
}
