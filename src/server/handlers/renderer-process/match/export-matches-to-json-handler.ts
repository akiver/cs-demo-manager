import { handleError } from '../../handle-error';
import { exportMatchesToJson } from 'csdm/node/json/export-matches-to-json';

export type ExportMatchesToJsonPayload = {
  outputFolderPath: string;
  checksums: string[];
  minify: boolean;
};

export async function exportMatchesToJsonHandler(payload: ExportMatchesToJsonPayload) {
  try {
    await exportMatchesToJson(payload);
  } catch (error) {
    handleError(error, 'Error while exporting matches to JSON');
  }
}
