import { ErrorCode } from 'csdm/common/error-code';
import { FiveEPlayApiError } from './5eplay-api-error';

export class FiveEPlayResourceNotFound extends FiveEPlayApiError {
  public constructor() {
    super();
    this.code = ErrorCode.FiveEPlayApiResourceNotFound;
    this.message = '5EPlay resource not found';
  }
}
