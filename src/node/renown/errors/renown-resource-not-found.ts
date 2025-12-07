import { ErrorCode } from 'csdm/common/error-code';
import { RenownApiError } from './renown-api-error';

export class RenownResourceNotFound extends RenownApiError {
  public constructor() {
    super();
    this.code = ErrorCode.RenownApiResourceNotFound;
    this.message = 'Renown resource not found';
  }
}
