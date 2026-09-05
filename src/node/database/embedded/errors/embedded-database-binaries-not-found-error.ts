import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class EmbeddedDatabaseBinariesNotFoundError extends BaseError {
  public constructor(binariesFolderPath: string) {
    super(ErrorCode.EmbeddedDatabaseBinariesNotFound);
    this.message = `PostgreSQL binaries not found in ${binariesFolderPath}.`;
  }
}
