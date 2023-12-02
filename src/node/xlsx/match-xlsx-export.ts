import { fetchMatchesByChecksums } from 'csdm/node/database/matches/fetch-matches-by-checksums';
import { GeneralSheet } from './match-export/general-sheet';
import { KillsSheet } from './match-export/kills-sheet';
import { PlayersSheet } from './match-export/players-sheet';
import { RoundsSheet } from './match-export/rounds-sheet';
import { SheetName } from './sheet-name';
import { Workbook } from './workbook';

type MatchXlsxExportOptions = {
  checksum: string;
  outputFilePath: string;
  sheets: {
    [SheetName.General]: boolean;
    [SheetName.Players]: boolean;
    [SheetName.Rounds]: boolean;
    [SheetName.Kills]: boolean;
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
        const generalSheet = new GeneralSheet(this.workbook, match);
        generalSheet.generate();
      }
      if (this.options.sheets[SheetName.Rounds]) {
        const roundsSheet = new RoundsSheet(this.workbook, match);
        roundsSheet.generate();
      }
      if (this.options.sheets[SheetName.Players]) {
        const playersSheet = new PlayersSheet(this.workbook, match);
        playersSheet.generate();
      }
      if (this.options.sheets[SheetName.Kills]) {
        const killsSheet = new KillsSheet(this.workbook, match);
        killsSheet.generate();
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
