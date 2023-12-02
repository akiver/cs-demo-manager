import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class VirtualDubNotInstalled extends BaseError {
  public constructor() {
    super(ErrorCode.VirtualDubNotInstalled);
    this.message = 'VirtualDub is not installed';
  }
}
