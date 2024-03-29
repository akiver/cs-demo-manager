import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';
import { GeneralSheet } from './match-export/general-sheet';
import { KillsSheet } from './match-export/kills-sheet';
import { PlayersSheet } from './match-export/players-sheet';
import { RoundsSheet } from './match-export/rounds-sheet';
import { SheetName } from './sheet-name';
import { Workbook } from './workbook';
import { WeaponsSheet } from './match-export/weapons-sheet';
import { PlayersFlashbangMatrixSheet } from './match-export/players-flashbang-matrix-sheet';
import { CLutchesSheet } from './match-export/clutches-sheet';

type MatchXlsxExportOptions = {
  checksum: string;
  outputFilePath: string;
  sheets: {
    [SheetName.General]: boolean;
    [SheetName.Players]: boolean;
    [SheetName.Rounds]: boolean;
    [SheetName.Kills]: boolean;
    [SheetName.Weapons]: boolean;
    [SheetName.Clutches]: boolean;
    [SheetName.PlayersFlashbangMatrix]: boolean;
  };
};

export class MatchXlsxExport {
  private readonly workbook: Workbook;
  private readonly options: MatchXlsxExportOptions;

  public constructor(options: MatchXlsxExportOptions) {
    this.options = options;
    this.workbook = new Workbook();
  }

  public async generate() {
    try {
      await this.workbook.initialize();

      const [match] = await fetchMatchesByChecksums([this.options.checksum]);
      if (this.options.sheets[SheetName.General]) {
        const sheet = new GeneralSheet(this.workbook, match);
        sheet.generate();
      }
      if (this.options.sheets[SheetName.Rounds]) {
        const sheet = new RoundsSheet(this.workbook, match);
        sheet.generate();
      }
      if (this.options.sheets[SheetName.Players]) {
        const sheet = new PlayersSheet(this.workbook, match);
        sheet.generate();
      }
      if (this.options.sheets[SheetName.Kills]) {
        const sheet = new KillsSheet(this.workbook, match);
        sheet.generate();
      }
      if (this.options.sheets[SheetName.Weapons]) {
        const sheet = new WeaponsSheet(this.workbook, match);
        await sheet.generate();
      }
      if (this.options.sheets[SheetName.PlayersFlashbangMatrix]) {
        const sheet = new PlayersFlashbangMatrixSheet(this.workbook, match);
        await sheet.generate();
      }
      if (this.options.sheets[SheetName.Clutches]) {
        const sheet = new CLutchesSheet(this.workbook, match);
        sheet.generate();
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
