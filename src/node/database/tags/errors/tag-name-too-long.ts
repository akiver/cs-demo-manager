import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class TagNameTooLong extends BaseError {
  public constructor() {
    super(ErrorCode.TagNameTooLong);
    this.message = 'Tag name too long';
  }
}
