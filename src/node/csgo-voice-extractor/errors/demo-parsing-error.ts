import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DemoParsingError extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorParsingError);
    this.message = 'Error while parsing demo';
  }
}
