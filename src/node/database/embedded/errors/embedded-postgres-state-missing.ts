import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresStateMissing extends BaseError {
  public constructor(stateFilePath: string) {
    super(ErrorCode.EmbeddedPostgresStateMissing);
    this.message = `The credentials of the built-in database are missing or unreadable: ${stateFilePath}`;
  }
}
