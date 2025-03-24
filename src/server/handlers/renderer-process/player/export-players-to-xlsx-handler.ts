import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import type { PlayerSheetName } from 'csdm/node/xlsx/player-sheet-name';
import type { MatchFilters } from 'csdm/node/database/match/apply-match-filters';
import { PlayerXlsxExport } from 'csdm/node/xlsx/player-export/player-export';
import { PlayersXlsxExport } from 'csdm/node/xlsx/players-export/players-xlsx-export';
import type { ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';

type SheetsVisibility = {
  [PlayerSheetName.General]: boolean;
  [PlayerSheetName.Players]: boolean;
  [PlayerSheetName.Maps]: boolean;
  [PlayerSheetName.Rounds]: boolean;
  [PlayerSheetName.Clutch]: boolean;
  [PlayerSheetName.Utility]: boolean;
  [PlayerSheetName.Economy]: boolean;
};

export type ExportPlayersToXlsxPayload =
  | {
      exportEachPlayerToSingleFile: true;
      outputFolderPath: string;
      sheets: SheetsVisibility;
      steamIds: string[];
      filters?: MatchFilters;
    }
  | {
      exportEachPlayerToSingleFile: false;
      outputFilePath: string;
      sheets: SheetsVisibility;
      steamIds: string[];
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
          filters: payload.filters,
          sheets: payload.sheets,
          outputFilePath,
        });
        await xlsxExport.generate();
      }
    } else {
      const xlsxExport = new PlayersXlsxExport({
        steamIds: payload.steamIds,
        outputFilePath: payload.outputFilePath,
        sheets: payload.sheets,
        onSheetGenerationStart(sheetName) {
          server.sendMessageToRendererProcess({
            name: RendererServerMessageName.ExportToXlsxSheetProgress,
            payload: sheetName,
          });
        },
      });
      await xlsxExport.generate();
    }

    const successPayload: ExportToXlsxSuccessPayload = payload.exportEachPlayerToSingleFile
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
