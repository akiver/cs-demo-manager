import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DownloadFolderNotDefined extends BaseError {
  public constructor() {
    super(ErrorCode.DownloadFolderNotDefined);
    this.message = 'Download folder not defined';
  }
}
