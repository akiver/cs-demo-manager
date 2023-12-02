import type { ChatMessage } from 'csdm/common/types/chat-message';
import { db } from 'csdm/node/database/database';
import { chatMessageRowToChatMessage } from './chat-message-row-to-chat-message';

export async function fetchChatMessages(checksum: string): Promise<ChatMessage[]> {
  const rows = await db.selectFrom('chat_messages').selectAll().where('match_checksum', '=', checksum).execute();
  const chatMessages: ChatMessage[] = rows.map((row) => {
    return chatMessageRowToChatMessage(row);
  });

  return chatMessages;
}
