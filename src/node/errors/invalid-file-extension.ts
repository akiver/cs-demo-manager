import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidFileExtension extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidFileExtension);
    this.message = `Invalid file extension`;
  }
}
