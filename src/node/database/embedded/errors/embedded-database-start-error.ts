import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class EmbeddedDatabaseStartError extends BaseError {
  public constructor(details: string, cause?: unknown) {
    super(ErrorCode.EmbeddedDatabaseStartFailed, cause);
    this.message = `Failed to start the embedded database: ${details}`;
  }
}
