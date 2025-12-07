import { ErrorCode } from 'csdm/common/error-code';
import { RenownApiError } from './renown-api-error';

export class RenownInvalidRequest extends RenownApiError {
  public constructor() {
    super();
    this.code = ErrorCode.RenownInvalidRequest;
    this.message = 'Renown API returned a 400';
  }
}
