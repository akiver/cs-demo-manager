import { MatchesXlsxExport } from 'csdm/node/xlsx/matches-xlsx-export';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { MatchXlsxExport } from 'csdm/node/xlsx/match-xlsx-export';
import type { SheetName } from 'csdm/node/xlsx/sheet-name';
import type { ExportToXlsxSuccessPayload } from 'csdm/common/types/xlsx';

type SheetsVisibility = {
  [SheetName.General]: boolean;
  [SheetName.Players]: boolean;
  [SheetName.Rounds]: boolean;
  [SheetName.Kills]: boolean;
  [SheetName.Weapons]: boolean;
  [SheetName.Clutches]: boolean;
  [SheetName.PlayersFlashbangMatrix]: boolean;
};

export type ExportMatchesToXlsxPayload =
  | {
      exportEachMatchToSingleFile: true;
      outputFolderPath: string;
      sheets: SheetsVisibility;
      matches: {
        checksum: string;
        name: string;
      }[];
    }
  | {
      exportEachMatchToSingleFile: false;
      outputFilePath: string;
      sheets: SheetsVisibility;
      checksums: string[];
    };

export async function exportMatchesToXlsxHandler(payload: ExportMatchesToXlsxPayload) {
  try {
    if (payload.exportEachMatchToSingleFile) {
      for (const [index, match] of payload.matches.entries()) {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.ExportToXlsxProgress,
          payload: {
            count: index + 1,
            totalCount: payload.matches.length,
          },
        });

        const outputFilePath = `${payload.outputFolderPath}/${match.name}.xlsx`;
        const xlsxExport = new MatchXlsxExport({
          checksum: match.checksum,
          outputFilePath,
          sheets: payload.sheets,
        });
        await xlsxExport.generate();
      }
    } else {
      const xlsxExport = new MatchesXlsxExport({
        checksums: payload.checksums,
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

    const successPayload: ExportToXlsxSuccessPayload = payload.exportEachMatchToSingleFile
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
    logger.error('Error while exporting matches to XLSX');
    logger.error(error);
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.ExportToXlsxError,
    });
  }
}
