import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidShareCode extends BaseError {
  public constructor(shareCode: string) {
    super(ErrorCode.InvalidShareCode);
    this.message = `Invalid share code ${shareCode}`;
  }
}
