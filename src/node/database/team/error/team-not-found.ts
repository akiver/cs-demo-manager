import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class TeamNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.TeamNotFound);
    this.message = 'Team not found';
  }
}
