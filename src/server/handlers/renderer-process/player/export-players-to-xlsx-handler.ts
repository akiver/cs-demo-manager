import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import type { PlayerSheetName } from 'csdm/node/xlsx/player-sheet-name';
import type { FetchPlayerFilters } from 'csdm/node/database/player/fetch-player-filters';
import { PlayerXlsxExport } from 'csdm/node/xlsx/player-export/player-export';

type SheetsVisibility = {
  [PlayerSheetName.General]: boolean;
  [PlayerSheetName.Maps]: boolean;
};

export type ExportPlayersToXlsxPayload =
  | {
      exportEachPlayerToSingleFile: true;
      outputFolderPath: string;
      sheets: SheetsVisibility;
      steamIds: string[];
      filter: Omit<FetchPlayerFilters, 'steamId'>;
    }
  | {
      exportEachPlayerToSingleFile: false;
      outputFilePath: string;
      sheets: SheetsVisibility;
      steamIds: string[];
      filter: Omit<FetchPlayerFilters, 'steamId'>;
    };

export type ExportMatchesToXlsxProgressPayload = {
  matchCount: number;
  totalMatchCount: number;
};

export type ExportMatchesToXlsxSuccessPayload = {
  outputType: 'file' | 'folder';
  outputPath: string;
};

export async function exportPlayersToXlsxHandler(payload: ExportPlayersToXlsxPayload) {
  try {
    if (payload.exportEachPlayerToSingleFile) {
      for (const [index, steamId] of payload.steamIds.entries()) {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.ExportToXlsxProgress,
          payload: {
            count: index + 1,
            totalCount: payload.steamIds.length,
          },
        });

        const outputFilePath = `${payload.outputFolderPath}/${steamId}.xlsx`;
        const xlsxExport = new PlayerXlsxExport({
          steamId,
          filter: payload.filter,
          sheets: payload.sheets,
          outputFilePath,
        });
        await xlsxExport.generate();
      }
    } else {
      // const xlsxExport = new MatchesXlsxExport({
      //   checksums: payload.checksums,
      //   outputFilePath: payload.outputFilePath,
      //   sheets: payload.sheets,
      //   onSheetGenerationStart(sheetName) {
      //     server.sendMessageToRendererProcess({
      //       name: RendererServerMessageName.ExportMatchesToXlsxSheetProgress,
      //       payload: sheetName,
      //     });
      //   },
      // });
      // await xlsxExport.generate();
    }

    const successPayload: ExportMatchesToXlsxSuccessPayload = payload.exportEachPlayerToSingleFile
      ? {
          outputType: 'folder',
          outputPath: payload.outputFolderPath,
        }
      : {
          outputType: 'file',
          outputPath: payload.outputFilePath,
        };

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.ExportToXlsxSuccess,
      payload: successPayload,
    });
  } catch (error) {
    logger.error('Error while exporting players to XLSX');
    logger.error(error);
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.ExportToXlsxError,
    });
  }
}
