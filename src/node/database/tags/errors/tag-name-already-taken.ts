import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class TagNameAlreadyTaken extends BaseError {
  public constructor() {
    super(ErrorCode.TagNameAlreadyTaken);
    this.message = 'Tag name already taken';
  }
}
