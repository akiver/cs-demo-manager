import type { Workbook } from '../workbook';
import { Sheet } from '../sheet';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';

export abstract class SinglePlayerExportSheet<RowType> extends Sheet<RowType> {
  protected readonly steamId: string;
  protected readonly filters?: MatchFilters;

  public constructor(workbook: Workbook, steamId: string, filters?: MatchFilters) {
    super(workbook);
    this.steamId = steamId;
    this.filters = filters;
  }
}
