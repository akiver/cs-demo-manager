import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresVersionMismatch extends BaseError {
  public constructor(clusterVersion: string, binariesVersion: string) {
    super(ErrorCode.EmbeddedPostgresVersionMismatch);
    this.message = `The built-in database was created with PostgreSQL ${clusterVersion} but the app ships PostgreSQL ${binariesVersion}`;
  }
}
