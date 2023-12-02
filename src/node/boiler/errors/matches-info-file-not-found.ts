import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MatchesInfoFileNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerMatchesFileNotFound);
    this.message = 'matches.info file not found';
  }
}
