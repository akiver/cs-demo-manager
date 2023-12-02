import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class FfmpegNotInstalled extends BaseError {
  public constructor() {
    super(ErrorCode.FfmpegNotInstalled);
    this.message = 'FFmpeg is not installed';
  }
}
