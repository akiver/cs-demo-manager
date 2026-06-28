import type { ChatMessage } from 'csdm/common/types/chat-message';
import { db } from 'csdm/node/database/database';
import { chatMessageRowToChatMessage } from './chat-message-row-to-chat-message';

export async function fetchChatMessages(checksum: string, steamIds?: string[]): Promise<ChatMessage[]> {
  let query = db
    .selectFrom('chat_messages')
    .selectAll()
    .leftJoin('steam_account_overrides', 'chat_messages.sender_steam_id', 'steam_account_overrides.steam_id')
    .select([db.fn.coalesce('steam_account_overrides.name', 'chat_messages.sender_name').as('sender_name')])
    .where('match_checksum', '=', checksum);

  if (Array.isArray(steamIds) && steamIds.length > 0) {
    query = query.where('chat_messages.sender_steam_id', 'in', steamIds);
  }

  const rows = await query.execute();
  const chatMessages: ChatMessage[] = rows.map((row) => {
    return chatMessageRowToChatMessage(row);
  });

  return chatMessages;
}
