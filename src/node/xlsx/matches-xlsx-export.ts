import { KillsSheet } from './matches-export/kills-sheet';
import { MatchesSheet } from './matches-export/matches-sheet';
import { PlayersSheet } from './matches-export/players-sheet';
import { RoundsSheet } from './matches-export/rounds-sheet';
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
      if (this.options.sheets[SheetName.General]) {
        this.options.onSheetGenerationStart?.(SheetName.General);
        const matchesSheet = new MatchesSheet(this.workbook, this.options.checksums);
        await matchesSheet.generate();
      }

      if (this.options.sheets[SheetName.Rounds]) {
        this.options.onSheetGenerationStart?.(SheetName.Rounds);
        const roundsSheet = new RoundsSheet(this.workbook, this.options.checksums);
        await roundsSheet.generate();
      }

      if (this.options.sheets[SheetName.Players]) {
        this.options.onSheetGenerationStart?.(SheetName.Players);
        const playersSheet = new PlayersSheet(this.workbook, this.options.checksums);
        await playersSheet.generate();
      }

      if (this.options.sheets[SheetName.Kills]) {
        this.options.onSheetGenerationStart?.(SheetName.Kills);
        const killsSheet = new KillsSheet(this.workbook, this.options.checksums);
        await killsSheet.generate();
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
