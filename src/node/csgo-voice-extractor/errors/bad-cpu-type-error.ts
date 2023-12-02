import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class BadCpuTypeError extends BaseError {
  public constructor() {
    super(ErrorCode.BadCpuType);
    this.message = 'Bad CPU type';
  }
}
