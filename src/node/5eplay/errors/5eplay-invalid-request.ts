import { ErrorCode } from 'csdm/common/error-code';
import { FiveEPlayApiError } from './5eplay-api-error';

export class FiveEPlayInvalidRequest extends FiveEPlayApiError {
  public constructor() {
    super();
    this.code = ErrorCode.FiveEPlayApiInvalidRequest;
    this.message = '5EPlay API returned a 400';
  }
}
