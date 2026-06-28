import { fetchChatMessages } from '../database/chat-messages/fetch-chat-messages';
import { writeChatMessagesToFile } from './write-chat-messages-to-file';
import type { ChatMessage } from 'csdm/common/types/chat-message';

export async function exportMatchChatMessages(
  checksum: string,
  filePath: string,
  messages?: ChatMessage[],
  steamIds?: string[],
) {
  let chatMessages: ChatMessage[];
  if (!messages) {
    chatMessages = await fetchChatMessages(checksum, steamIds);
  } else if (Array.isArray(steamIds) && steamIds.length > 0) {
    chatMessages = messages.filter((chatMessage) => steamIds.includes(chatMessage.senderSteamId));
  } else {
    chatMessages = messages;
  }

  return await writeChatMessagesToFile(chatMessages, filePath);
}
