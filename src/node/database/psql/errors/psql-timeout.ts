import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class PsqlTimeout extends BaseError {
  public constructor() {
    super(ErrorCode.PsqlTimeout);
    this.message = 'PSQL timeout';
  }
}
