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
      // TODO refactor Use a loop
      if (this.options.sheets[SheetName.General]) {
        this.options.onSheetGenerationStart?.(SheetName.General);
        const sheet = new MatchesSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      if (this.options.sheets[SheetName.Rounds]) {
        this.options.onSheetGenerationStart?.(SheetName.Rounds);
        const sheet = new RoundsSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      if (this.options.sheets[SheetName.Players]) {
        this.options.onSheetGenerationStart?.(SheetName.Players);
        const sheet = new PlayersSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      if (this.options.sheets[SheetName.Kills]) {
        this.options.onSheetGenerationStart?.(SheetName.Kills);
        const sheet = new KillsSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      if (this.options.sheets[SheetName.Weapons]) {
        this.options.onSheetGenerationStart?.(SheetName.Weapons);
        const sheet = new WeaponsSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      if (this.options.sheets[SheetName.Clutches]) {
        this.options.onSheetGenerationStart?.(SheetName.Clutches);
        const sheet = new ClutchesSheet(this.workbook, this.options.checksums);
        await sheet.generate();
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
