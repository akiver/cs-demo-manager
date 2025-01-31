import fs from 'fs-extra';
import type { ChatMessage } from 'csdm/common/types/chat-message';

function formatChatMessage(chatMessage: ChatMessage) {
  const { senderIsAlive, senderName, message } = chatMessage;
  const playerStatus = senderIsAlive ? '' : '*DEAD* ';

  return `${playerStatus}${senderName} : ${message}`;
}

export async function writeChatMessagesToFile(messages: ChatMessage[], filePath: string) {
  if (messages.length === 0) {
    return false;
  }

  const formattedChatMessages = messages.map(formatChatMessage);
  const text = formattedChatMessages.join('\n');
  await fs.writeFile(filePath, text);

  return true;
}
