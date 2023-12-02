import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class VirtualDubError extends BaseError {
  public constructor() {
    super(ErrorCode.VirtualDubError);
    this.message = 'VirtualDub error';
  }
}
