import { BaseError } from 'csdm/node/errors/base-error';
import { ErrorCode } from 'csdm/common/error-code';

export class InvalidMatchDate extends BaseError {
  public value: string;
  public constructor(value: string) {
    super(ErrorCode.InvalidMatchDate);
    this.message = 'Invalid match date';
    this.value = value;
  }
}
