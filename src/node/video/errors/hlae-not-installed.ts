import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class HlaeNotInstalled extends BaseError {
  public constructor() {
    super(ErrorCode.HlaeNotInstalled);
    this.message = 'HLAE is not installed';
  }
}
