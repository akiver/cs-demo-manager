import type { Workbook } from '../workbook';
import { Sheet } from '../sheet';

export abstract class MultipleMatchExportSheet<RowType> extends Sheet<RowType> {
  protected checksums: string[];

  public constructor(workbook: Workbook, checksums: string[]) {
    super(workbook);
    this.checksums = checksums;
  }
}
