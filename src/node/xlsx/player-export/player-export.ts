import { PlayerSheetName } from '../player-sheet-name';
import { Workbook } from '../workbook';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { GeneralSheet } from './general-sheet';
import { MapsSheet } from './maps-sheet';
import { ClutchSheet } from './clutch-sheet';
import { EconomySheet } from './economy-sheet';
import { UtilitySheet } from './utility-sheet';

type Options = {
  steamId: string;
  filters?: MatchFilters;
  outputFilePath: string;
  sheets: {
    [PlayerSheetName.General]: boolean;
    [PlayerSheetName.Maps]: boolean;
    [PlayerSheetName.Clutch]: boolean;
    [PlayerSheetName.Economy]: boolean;
    [PlayerSheetName.Utility]: boolean;
  };
};

export class PlayerXlsxExport {
  private readonly workbook: Workbook;
  private readonly options: Options;

  public constructor(options: Options) {
    this.options = options;
    this.workbook = new Workbook();
  }

  public async generate() {
    try {
      await this.workbook.initialize();

      const sheetMappings = [
        { name: PlayerSheetName.General, sheetClass: GeneralSheet },
        { name: PlayerSheetName.Maps, sheetClass: MapsSheet },
        { name: PlayerSheetName.Utility, sheetClass: UtilitySheet },
        { name: PlayerSheetName.Clutch, sheetClass: ClutchSheet },
        { name: PlayerSheetName.Economy, sheetClass: EconomySheet },
      ];

      for (const { name, sheetClass } of sheetMappings) {
        if (this.options.sheets[name]) {
          const sheet = new sheetClass(this.workbook, this.options.steamId, this.options.filters);
          await sheet.generate();
        }
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
