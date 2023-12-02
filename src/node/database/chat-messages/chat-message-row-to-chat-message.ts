import type { ChatMessage } from 'csdm/common/types/chat-message';
import type { ChatMessageRow } from './chat-message-table';

export function chatMessageRowToChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    matchChecksum: row.match_checksum,
    tick: row.tick,
    frame: row.frame,
    roundNumber: row.round_number,
    message: row.message,
    senderIsAlive: row.sender_is_alive,
    senderName: row.sender_name,
    senderSide: row.sender_side,
    senderSteamId: row.sender_steam_id,
  };
}
