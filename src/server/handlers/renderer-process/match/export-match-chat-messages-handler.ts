import fs from 'fs-extra';
import { handleError } from '../../handle-error';

export type ExportChatMessagesPayload = {
  filePath: string;
  messages: string[];
};

export async function exportMatchChatMessagesHandler({ filePath, messages }: ExportChatMessagesPayload) {
  try {
    const text = messages.join('\n');
    await fs.writeFile(filePath, text);
  } catch (error) {
    handleError(error, 'Error while exporting chat messages');
  }
}
