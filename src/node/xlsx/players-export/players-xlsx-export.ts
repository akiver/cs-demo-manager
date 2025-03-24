import { Workbook } from '../workbook';
import { PlayersSheet } from './players-sheet';
import { PlayerSheetName } from '../player-sheet-name';
import { ClutchSheet } from './clutch-sheet';
import { EconomySheet } from './economy-sheet';
import { MapsSheet } from './maps-sheet';
import { RoundsSheet } from './rounds-sheet';
import { UtilitySheet } from './utility-sheet';

type PlayersXlsxExportOptions = {
  steamIds: string[];
  outputFilePath: string;
  sheets: {
    [PlayerSheetName.Players]: boolean;
    [PlayerSheetName.Maps]: boolean;
    [PlayerSheetName.Rounds]: boolean;
    [PlayerSheetName.Utility]: boolean;
    [PlayerSheetName.Clutch]: boolean;
    [PlayerSheetName.Economy]: boolean;
  };
  onSheetGenerationStart?: (sheetName: PlayerSheetName) => void;
};

export class PlayersXlsxExport {
  private readonly options: PlayersXlsxExportOptions;
  private readonly workbook: Workbook;

  public constructor(options: PlayersXlsxExportOptions) {
    this.options = options;
    this.workbook = new Workbook();
  }

  public async generate() {
    try {
      await this.workbook.initialize();
      const sheetMappings = [
        { name: PlayerSheetName.Players, sheetClass: PlayersSheet },
        { name: PlayerSheetName.Maps, sheetClass: MapsSheet },
        { name: PlayerSheetName.Rounds, sheetClass: RoundsSheet },
        { name: PlayerSheetName.Utility, sheetClass: UtilitySheet },
        { name: PlayerSheetName.Clutch, sheetClass: ClutchSheet },
        { name: PlayerSheetName.Economy, sheetClass: EconomySheet },
      ];

      for (const { name, sheetClass } of sheetMappings) {
        if (this.options.sheets[name]) {
          this.options.onSheetGenerationStart?.(name);
          const sheet = new sheetClass(this.workbook, this.options.steamIds);
          await sheet.generate();
        }
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
