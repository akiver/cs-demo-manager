import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class FileNotFound extends BaseError {
  public constructor(filePath: string) {
    super(ErrorCode.FileNotFound);
    this.message = `File not found: ${filePath}`;
  }
}
