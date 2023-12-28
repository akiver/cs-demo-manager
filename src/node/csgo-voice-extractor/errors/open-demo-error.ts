import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class OpenDemoError extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorOpenDemoError);
    this.message = 'Failed to open the demo file';
  }
}
