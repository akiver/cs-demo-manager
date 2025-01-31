import React, { useState } from 'react';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { ExportChatMessagesButton } from 'csdm/ui/match/chat-messages/export-chat-messages-button';
import { ChatMessagesList } from './chat-messages-list';
import { EmptyChatMessages } from './empty-chat-messages';
import { useCurrentMatch } from '../use-current-match';
import { TextInputFilter } from 'csdm/ui/components/inputs/text-input-filter';

export function ChatMessages() {
  const match = useCurrentMatch();
  const [fuzzySearchText, setFuzzySearchText] = useState('');

  const { chatMessages, checksum } = match;
  if (chatMessages.length === 0) {
    return <EmptyChatMessages />;
  }

  let visibleChatMessages = match.chatMessages;
  if (fuzzySearchText !== '') {
    visibleChatMessages = match.chatMessages.filter(({ senderName, message }) => {
      const query = fuzzySearchText.toLowerCase();
      return message.toLowerCase().includes(query) || senderName.toLowerCase().includes(query);
    });
  }

  return (
    <>
      <ActionBar
        left={<ExportChatMessagesButton checksum={checksum} messages={visibleChatMessages} />}
        right={<TextInputFilter value={fuzzySearchText} onChange={setFuzzySearchText} />}
      />
      <ChatMessagesList chatMessages={visibleChatMessages} />
    </>
  );
}
