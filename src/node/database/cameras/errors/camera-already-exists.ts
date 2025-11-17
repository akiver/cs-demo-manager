import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CameraAlreadyExists extends BaseError {
  public constructor() {
    super(ErrorCode.CameraAlreadyExists);
    this.message = 'Camera already exists';
  }
}
