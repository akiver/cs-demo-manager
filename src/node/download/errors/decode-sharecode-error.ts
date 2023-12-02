import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DecodeShareCodeError extends BaseError {
  public constructor(shareCode: string) {
    super(ErrorCode.DecodeShareCodeError);
    this.message = `Error decoding share code ${shareCode}`;
  }
}
