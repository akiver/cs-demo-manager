import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class AudioDecodingError extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorDecodingError);
    this.message = 'Audio decoding error';
  }
}
