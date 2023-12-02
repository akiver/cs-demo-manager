import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MatchNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.MatchNotFound);
    this.message = 'Match not found';
  }
}
