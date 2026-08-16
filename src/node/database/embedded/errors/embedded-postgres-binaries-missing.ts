import { ErrorCode } from 'csdm/common/error-code';
import { BaseError } from 'csdm/node/errors/base-error';

export class EmbeddedPostgresBinariesMissing extends BaseError {
  public constructor(binaryPath: string) {
    super(ErrorCode.EmbeddedPostgresBinariesMissing);
    this.message = `The bundled PostgreSQL binary is missing: ${binaryPath}`;
  }
}
