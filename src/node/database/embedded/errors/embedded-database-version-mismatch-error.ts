import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class EmbeddedDatabaseVersionMismatchError extends BaseError {
  public constructor(dataFolderVersion: number, binariesVersion: number) {
    super(ErrorCode.EmbeddedDatabaseVersionMismatch);
    this.message = `The embedded database files were created by PostgreSQL ${dataFolderVersion} but the bundled server is PostgreSQL ${binariesVersion}.`;
  }
}
