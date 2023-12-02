import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class WriteFileError extends BaseError {
  public constructor() {
    super(ErrorCode.BoilerWriteFileFailure);
    this.message = 'Error while writing protobuf file';
  }
}
