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
  const internalAllTeamValue = 'csdm-all-teams';
  const internalAllPlayersValue = 'csdm-all-players';
  const [teamName, setTeamName] = useState(internalAllTeamValue);
  const [playerSteamId, setPlayerSteamId] = useState(internalAllPlayersValue);
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

  if (teamName !== internalAllTeamValue) {
    const teamPlayers = match.players.filter((player) => player.teamName === teamName);
    visibleChatMessages = visibleChatMessages.filter(({ senderSteamId }) =>
      teamPlayers.some((player) => player.steamId === senderSteamId),
    );
  }

  if (playerSteamId !== internalAllPlayersValue) {
    visibleChatMessages = visibleChatMessages.filter((message) => message.senderSteamId === playerSteamId);
  }

  const options: SelectOption[] = [
    { value: internalAllTeamValue, label: <Trans>All teams</Trans> },
    { value: match.teamA.name, label: match.teamA.name },
    { value: match.teamB.name, label: match.teamB.name },
  ];

  // Build the player list from the chat senders so everyone who actually spoke is selectable,
  // including players who are no longer part of the match's final players list.
  const senderNameBySteamId = new Map<string, string>();
  for (const { senderSteamId, senderName } of match.chatMessages) {
    // Skip empty SteamIDs since an empty string can't be used as a Select option value.
    if (senderSteamId !== '' && !senderNameBySteamId.has(senderSteamId)) {
      senderNameBySteamId.set(senderSteamId, senderName);
    }
  }
  const playerOptions: SelectOption[] = [
    { value: internalAllPlayersValue, label: <Trans>All players</Trans> },
    ...Array.from(senderNameBySteamId, ([steamId, name]) => ({ value: steamId, label: name })).sort((a, b) =>
      String(a.label).localeCompare(String(b.label)),
    ),
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
            <Select
              options={playerOptions}
              value={playerSteamId}
              onChange={(playerSteamId) => {
                setPlayerSteamId(playerSteamId);
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
