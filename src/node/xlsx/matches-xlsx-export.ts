import { ClutchesSheet } from './matches-export/clutches-sheet';
import { KillsSheet } from './matches-export/kills-sheet';
import { MatchesSheet } from './matches-export/matches-sheet';
import { PlayersSheet } from './matches-export/players-sheet';
import { RoundsSheet } from './matches-export/rounds-sheet';
import { WeaponsSheet } from './matches-export/weapons-sheet';
import { SheetName } from './sheet-name';
import { Workbook } from './workbook';

type MatchesXlsxExportOptions = {
  checksums: string[];
  outputFilePath: string;
  sheets: {
    [SheetName.General]: boolean;
    [SheetName.Players]: boolean;
    [SheetName.Rounds]: boolean;
    [SheetName.Kills]: boolean;
    [SheetName.Weapons]: boolean;
    [SheetName.Clutches]: boolean;
  };
  onSheetGenerationStart?: (sheetName: SheetName) => void;
};

export class MatchesXlsxExport {
  private readonly options: MatchesXlsxExportOptions;
  private readonly workbook: Workbook;

  public constructor(options: MatchesXlsxExportOptions) {
    this.options = options;
    this.workbook = new Workbook();
  }

  public async generate() {
    try {
      await this.workbook.initialize();
      const sheetMappings = [
        { name: SheetName.General, sheetClass: MatchesSheet },
        { name: SheetName.Rounds, sheetClass: RoundsSheet },
        { name: SheetName.Players, sheetClass: PlayersSheet },
        { name: SheetName.Kills, sheetClass: KillsSheet },
        { name: SheetName.Weapons, sheetClass: WeaponsSheet },
        { name: SheetName.Clutches, sheetClass: ClutchesSheet },
      ];

      for (const { name, sheetClass } of sheetMappings) {
        if (this.options.sheets[name]) {
          this.options.onSheetGenerationStart?.(name);
          const sheet = new sheetClass(this.workbook, this.options.checksums);
          await sheet.generate();
        }
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
