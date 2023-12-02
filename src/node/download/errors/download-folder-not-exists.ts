import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DownloadFolderNotExists extends BaseError {
  public constructor() {
    super(ErrorCode.DownloadFolderNotExists);
    this.message = `Download folder doesn't exist`;
  }
}
