import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class LoadCsgoLibError extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorLoadCsgoLibError);
    this.message = 'Failed to load CSGO audio library';
  }
}
