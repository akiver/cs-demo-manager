import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidDemoHeader extends BaseError {
  public constructor(reason: string) {
    super(ErrorCode.InvalidDemoHeader);
    this.message = `Invalid demo header: ${reason}`;
  }
}
