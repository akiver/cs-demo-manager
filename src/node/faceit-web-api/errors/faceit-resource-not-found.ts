import { ErrorCode } from 'csdm/common/error-code';
import { FaceitApiError } from './faceit-api-error';

export class FaceitResourceNotFound extends FaceitApiError {
  public constructor() {
    super();
    this.code = ErrorCode.FaceItApiResourceNotFound;
    this.message = 'FACEIT resource not found';
  }
}
