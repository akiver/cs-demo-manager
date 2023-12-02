import { ErrorCode } from 'csdm/common/error-code';
import { FaceitApiError } from './faceit-api-error';

export class FaceitUnauthorized extends FaceitApiError {
  public constructor() {
    super();
    this.code = ErrorCode.FaceItApiUnauthorized;
    this.message = 'FACEIT API returned a 401';
  }
}
