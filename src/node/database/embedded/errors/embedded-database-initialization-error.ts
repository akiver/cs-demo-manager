import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class EmbeddedDatabaseInitializationError extends BaseError {
  public constructor(details: string) {
    super(ErrorCode.EmbeddedDatabaseInitializationFailed);
    this.message = `Failed to initialize the embedded database: ${details}`;
  }
}
