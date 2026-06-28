import { fetchChatMessages } from '../database/chat-messages/fetch-chat-messages';
import path from 'node:path';
import { writeChatMessagesToFile } from './write-chat-messages-to-file';

export async function exportMatchesChatMessages(checksums: string[], outputFolder: string, steamIds?: string[]) {
  let hasExportedAtLeastOneMatch = false;

  await Promise.all(
    checksums.map(async (checksum) => {
      const messages = await fetchChatMessages(checksum, steamIds);
      const filePath = path.join(outputFolder, `messages-${checksum}.txt`);
      const hasWrittenFile = await writeChatMessagesToFile(messages, filePath);
      if (hasWrittenFile) {
        hasExportedAtLeastOneMatch = true;
      }
    }),
  );

  return hasExportedAtLeastOneMatch;
}
