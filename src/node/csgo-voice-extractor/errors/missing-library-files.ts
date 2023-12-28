import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class MissingLibraryFiles extends BaseError {
  public constructor() {
    super(ErrorCode.CsVoiceExtractorMissingLibraryFiles);
    this.message = 'Missing library files';
  }
}
