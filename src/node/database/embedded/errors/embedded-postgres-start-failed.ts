import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresStartFailed extends BaseError {
  public constructor(message: string, cause?: unknown) {
    super(ErrorCode.EmbeddedPostgresStartFailed, cause);
    this.message = message;
  }
}
