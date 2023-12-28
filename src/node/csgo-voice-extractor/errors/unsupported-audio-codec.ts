import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class UnsupportedAudioCodec extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorUnsupportedAudioCodec);
    this.message = 'Unsupported audio codec';
  }
}
