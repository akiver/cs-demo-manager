import type { Match } from 'csdm/common/types/match';
import type { Workbook } from '../workbook';
import { Sheet } from '../sheet';

export abstract class SingleMatchExportSheet<RowType> extends Sheet<RowType> {
  protected match: Match;

  public constructor(workbook: Workbook, match: Match) {
    super(workbook);
    this.match = match;
  }
}
