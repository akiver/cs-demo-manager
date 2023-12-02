import { ErrorCode } from 'csdm/common/error-code';
import { CommandError } from 'csdm/node/video/errors/command-error';

export class StartCounterStrikeError extends CommandError {
  public constructor(output: string) {
    super(ErrorCode.StartCounterStrikeError, 'Failed to start Counter-Strike', output);
  }
}
