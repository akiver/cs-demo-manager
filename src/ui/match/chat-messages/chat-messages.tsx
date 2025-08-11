import React, { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { ActionBar } from 'csdm/ui/components/action-bar';
import { ExportChatMessagesButton } from 'csdm/ui/match/chat-messages/export-chat-messages-button';
import { ChatMessagesList } from './chat-messages-list';
import { EmptyChatMessages } from './empty-chat-messages';
import { useCurrentMatch } from '../use-current-match';
import { TextInputFilter } from 'csdm/ui/components/inputs/text-input-filter';
import { Select, type SelectOption } from 'csdm/ui/components/inputs/select';

export function ChatMessages() {
  const match = useCurrentMatch();
  const [teamName, setTeamName] = useState('');
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

  if (teamName !== '') {
    const teamPlayers = match.players.filter((player) => player.teamName === teamName);
    visibleChatMessages = visibleChatMessages.filter(({ senderSteamId }) =>
      teamPlayers.some((player) => player.steamId === senderSteamId),
    );
  }

  const options: SelectOption[] = [
    { value: '', label: <Trans>All teams</Trans> },
    { value: match.teamA.name, label: match.teamA.name },
    { value: match.teamB.name, label: match.teamB.name },
  ];

  return (
    <>
      <ActionBar
        left={<ExportChatMessagesButton checksum={checksum} messages={visibleChatMessages} />}
        right={
          <>
            <Select
              options={options}
              value={teamName}
              onChange={(teamName) => {
                setTeamName(teamName);
              }}
            />
            <TextInputFilter value={fuzzySearchText} onChange={setFuzzySearchText} />
          </>
        }
      />
      <ChatMessagesList chatMessages={visibleChatMessages} />
    </>
  );
}
