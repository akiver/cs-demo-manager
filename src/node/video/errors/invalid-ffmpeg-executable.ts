import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidFfmpegExecutable extends BaseError {
  public constructor() {
    super(ErrorCode.InvalidFfmpegExecutable);
    this.message = 'Invalid FFmpeg executable';
  }
}
