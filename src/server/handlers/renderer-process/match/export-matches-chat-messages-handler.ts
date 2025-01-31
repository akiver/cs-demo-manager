import { exportMatchesChatMessages } from 'csdm/node/chat-messages/export-matches-chat-messages';
import { handleError } from '../../handle-error';

export type ExportMatchesChatMessagesPayload = { outputFolderPath: string; checksums: string[] };

export async function exportMatchesChatMessagesHandler({
  checksums,
  outputFolderPath,
}: ExportMatchesChatMessagesPayload) {
  try {
    return await exportMatchesChatMessages(checksums, outputFolderPath);
  } catch (error) {
    handleError(error, 'Error while exporting matches chat messages');
  }
}
