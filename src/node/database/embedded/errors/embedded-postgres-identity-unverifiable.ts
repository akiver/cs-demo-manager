import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresIdentityUnverifiable extends BaseError {
  public constructor(cause?: unknown) {
    super(ErrorCode.EmbeddedPostgresIdentityUnverifiable, cause);
    this.message =
      'The built-in database is still running, but its identity cannot be verified because its credentials are missing. Close every CS Demo Manager app and CLI process, make sure PostgreSQL has stopped, then try the reset again. No database files were deleted.';
  }
}
