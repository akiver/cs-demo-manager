import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class WavFileNotFound extends BaseError {
  public constructor() {
    super(ErrorCode.WavFileNotFound);
    this.message = 'WAV file not found';
  }
}
