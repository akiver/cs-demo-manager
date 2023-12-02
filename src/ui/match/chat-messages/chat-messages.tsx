import React from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { ExportChatMessagesButton } from 'csdm/ui/match/chat-messages/export-chat-messages-button';
import { ChatMessagesList } from './chat-messages-list';
import { EmptyChatMessages } from './empty-chat-messages';
import { useCurrentMatch } from '../use-current-match';

export function ChatMessages() {
  const match = useCurrentMatch();

  const { chatMessages, checksum } = match;
  if (chatMessages.length === 0) {
    return <EmptyChatMessages />;
  }

  return (
    <>
      <ActionBar left={<ExportChatMessagesButton checksum={checksum} chatMessages={chatMessages} />} />
      <ChatMessagesList chatMessages={chatMessages} />
    </>
  );
}
