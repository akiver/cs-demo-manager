import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class NoMatchesFound extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerNoMatchesFound);
    this.message = 'No matches found';
  }
}
