import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class PsqlNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.PsqlNotFound);
    this.message = 'PSQL binary not found';
  }
}
