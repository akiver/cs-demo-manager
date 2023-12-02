import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MatchAlreadyInDownloadQueue extends BaseError {
  public constructor() {
    super(ErrorCode.MatchAlreadyInDownloadQueue);
    this.message = 'Match already in download queue';
  }
}
