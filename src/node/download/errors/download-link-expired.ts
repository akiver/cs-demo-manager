import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class DownloadLinkExpired extends BaseError {
  public constructor() {
    super(ErrorCode.DemoLinkExpired);
    this.message = 'Download link expired';
  }
}
