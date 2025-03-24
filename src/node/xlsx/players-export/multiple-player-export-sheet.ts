import type { Workbook } from '../workbook';
import { Sheet } from '../sheet';

export abstract class MultiplePlayerExportSheet<RowType> extends Sheet<RowType> {
  protected steamIds: string[];

  public constructor(workbook: Workbook, steamIds: string[]) {
    super(workbook);
    this.steamIds = steamIds;
  }
}
