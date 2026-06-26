import { exportMatchesChatMessages } from 'csdm/node/chat-messages/export-matches-chat-messages';
import { handleError } from '../../handle-error';

export type ExportMatchesChatMessagesPayload = {
  outputFolderPath: string;
  checksums: string[];
  steamIds?: string[];
};

export async function exportMatchesChatMessagesHandler({
  checksums,
  outputFolderPath,
  steamIds,
}: ExportMatchesChatMessagesPayload) {
  try {
    return await exportMatchesChatMessages(checksums, outputFolderPath, steamIds);
  } catch (error) {
    handleError(error, 'Error while exporting matches chat messages');
  }
}
