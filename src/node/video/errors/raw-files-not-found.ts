import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class RawFilesNotFoundError extends BaseError {
  public constructor() {
    super(ErrorCode.RawFilesNotFound);
    this.message = 'Raw files not found';
  }
}
