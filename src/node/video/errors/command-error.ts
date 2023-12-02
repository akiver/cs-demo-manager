import { BaseError } from 'csdm/node/errors/base-error';
import type { ErrorCode } from 'csdm/common/error-code';

export class CommandError extends BaseError {
  public output: string;

  public constructor(code: ErrorCode, message: string, output: string) {
    super(code);
    this.message = message;
    this.output = output;
  }
}
