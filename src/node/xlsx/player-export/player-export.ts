import { PlayerSheetName } from '../player-sheet-name';
import { Workbook } from '../workbook';
import { fetchPlayer } from 'csdm/node/database/player/fetch-player';
import type { FetchPlayerFilters } from 'csdm/node/database/player/fetch-player-filters';
import { GeneralSheet } from './general-sheet';
import { MapsSheet } from './maps-sheet';
import { ClutchSheet } from './clutch-sheet';

type Options = {
  steamId: string;
  filter: Omit<FetchPlayerFilters, 'steamId'>;
  outputFilePath: string;
  sheets: {
    [PlayerSheetName.General]: boolean;
    [PlayerSheetName.Maps]: boolean;
    [PlayerSheetName.Clutch]: boolean;
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

      const player = await fetchPlayer(this.options.steamId, this.options.filter);
      if (this.options.sheets[PlayerSheetName.General]) {
        const sheet = new GeneralSheet(this.workbook, player);
        sheet.generate();
      }
      if (this.options.sheets[PlayerSheetName.Maps]) {
        const sheet = new MapsSheet(this.workbook, player.mapsStats);
        sheet.generate();
      }
      if (this.options.sheets[PlayerSheetName.Clutch]) {
        const sheet = new ClutchSheet(this.workbook, player.clutches);
        sheet.generate();
      }

      await this.workbook.write(this.options.outputFilePath);
    } finally {
      await this.workbook.release();
    }
  }
}
