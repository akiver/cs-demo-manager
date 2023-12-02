import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MapAlreadyExists extends BaseError {
  public constructor() {
    super(ErrorCode.MapAlreadyExists);
    this.message = 'Map already exists';
  }
}
