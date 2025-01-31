import type { ChatMessage } from 'csdm/common/types/chat-message';
import { handleError } from '../../handle-error';

import { exportMatchChatMessages } from 'csdm/node/chat-messages/export-match-chat-messages';

export type ExportChatMessagesPayload = {
  checksum: string;
  filePath: string;
  messages?: ChatMessage[];
};

export async function exportMatchChatMessagesHandler({ checksum, filePath, messages }: ExportChatMessagesPayload) {
  try {
    return await exportMatchChatMessages(checksum, filePath, messages);
  } catch (error) {
    handleError(error, 'Error while exporting chat messages');
  }
}
