import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class DatabaseTransitionInProgress extends BaseError {
  public constructor(message = 'The database cannot be changed while demo analyses are in progress.') {
    super(ErrorCode.DatabaseTransitionInProgress);
    this.name = 'DatabaseTransitionInProgress';
    this.message = message;
  }
}
