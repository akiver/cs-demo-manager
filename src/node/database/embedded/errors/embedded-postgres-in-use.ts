import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresInUse extends BaseError {
  public constructor() {
    super(ErrorCode.EmbeddedPostgresInUse);
    this.name = 'EmbeddedPostgresInUse';
    this.message = 'The built-in database is currently used by another CS Demo Manager process.';
  }
}
