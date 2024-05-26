import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class TeamsNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.TeamsNotFound);
    this.message = 'Teams not found';
  }
}
