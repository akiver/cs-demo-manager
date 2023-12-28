import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class NoVoiceDataFound extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorNoVoiceDataFound);
    this.message = 'No voice data found';
  }
}
