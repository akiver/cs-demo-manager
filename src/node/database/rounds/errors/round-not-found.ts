import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class RoundNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.RoundNotFound);
    this.message = 'Round not found';
  }
}
