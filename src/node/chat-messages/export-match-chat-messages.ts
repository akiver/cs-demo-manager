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
    chatMessages = await fetchChatMessages(checksum);
  } else {
    chatMessages = messages;
  }

  if (steamIds !== undefined && steamIds.length > 0) {
    chatMessages = chatMessages.filter((chatMessage) => steamIds.includes(chatMessage.senderSteamId));
  }

  return await writeChatMessagesToFile(chatMessages, filePath);
}
