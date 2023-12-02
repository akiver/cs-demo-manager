import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class SequencesAreOverlapping extends BaseError {
  public constructor() {
    super(ErrorCode.SequencesAreOverlapping);
    this.message = 'Sequences are overlapping';
  }
}
