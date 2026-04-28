import React from 'react';
import { useSequenceForm } from './use-sequence-form';
import { PlayerVoicesCheckbox } from '../player-voices-checkbox';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';

export function SequencePlayerVoicesCheckbox() {
  const { sequence, updateSequence } = useSequenceForm();
  const match = useCurrentMatch();

  return (
    <PlayerVoicesCheckbox
      defaultChecked={sequence.playerVoicesEnabled}
      onChange={(isChecked) => {
        updateSequence({
          playerVoicesEnabled: isChecked,
          voiceEnabledSteamIds: isChecked ? match.players.map((player) => player.steamId) : [],
        });
      }}
    />
  );
}
