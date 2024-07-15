import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DatabaseSchemaVersionMismatch extends BaseError {
  public constructor(databaseSchemaVersion: number, appSchemaVersion: number) {
    super(ErrorCode.DatabaseSchemaVersionMismatch);
    this.message = `Database schema version mismatch. Database schema version is ${databaseSchemaVersion}, app schema version is ${appSchemaVersion}.`;
  }
}
