import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DuplicateTeamNameError extends BaseError {
  public constructor(teamName: string) {
    super(ErrorCode.DuplicateTeamName);
    this.message = `Team names must be different (got: ${teamName})`;
  }
}
