import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresInitFailed extends BaseError {
  public constructor(message: string, cause?: unknown) {
    super(ErrorCode.EmbeddedPostgresInitFailed, cause);
    this.message = message;
  }
}
