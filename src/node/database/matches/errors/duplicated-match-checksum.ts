import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DuplicatedMatchChecksum extends BaseError {
  public constructor(cause: unknown) {
    super(ErrorCode.InsertMatchDuplicatedChecksum, cause);
    this.message = 'Duplicated match checksum';
  }
}
