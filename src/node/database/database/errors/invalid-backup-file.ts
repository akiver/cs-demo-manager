import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class InvalidBackupFile extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidBackupFile);
    this.message = 'Invalid backup file';
  }
}
