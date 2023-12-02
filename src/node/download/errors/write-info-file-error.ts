import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class WriteDemoInfoFileError extends BaseError {
  public constructor() {
    super(ErrorCode.WriteDemoInfoFileError);
    this.message = 'Error while writing demo info file.';
  }
}
