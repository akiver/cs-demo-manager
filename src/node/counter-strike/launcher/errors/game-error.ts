import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class GameError extends BaseError {
  public constructor() {
    super(ErrorCode.GameError);
    this.message = 'Game error';
  }
}
