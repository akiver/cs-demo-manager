import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class CreateAudioFileError extends BaseError {
  public constructor() {
    super(ErrorCode.CsgoVoiceExtractorCreateAudioFileError);
    this.message = 'Failed to create audio file';
  }
}
