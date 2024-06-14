import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MissingPlayerSlotError extends BaseError {
  public constructor() {
    super(ErrorCode.MissingPlayerSlot);
    this.message = 'Missing player slot';
  }
}
