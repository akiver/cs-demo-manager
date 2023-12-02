import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MatchAlreadyDownloaded extends BaseError {
  public constructor() {
    super(ErrorCode.MatchAlreadyDownloaded);
    this.message = 'Match already downloaded';
  }
}
