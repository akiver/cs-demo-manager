import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class EmbeddedDatabaseLocked extends BaseError {
  public constructor(lockedByPid: number) {
    super(ErrorCode.EmbeddedDatabaseLocked);
    this.message = `The embedded database is already in use by the process with PID ${lockedByPid}`;
  }
}
