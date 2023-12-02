import { ErrorCode } from 'csdm/common/error-code';
import { CommandError } from './command-error';

export class FFmpegError extends CommandError {
  public constructor(output: string) {
    super(ErrorCode.FfmpegError, 'FFmpeg error', output);
  }
}
