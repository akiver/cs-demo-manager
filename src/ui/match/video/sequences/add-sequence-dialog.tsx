import React from 'react';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { Sequence } from 'csdm/common/types/sequence';
import { SequenceDialog } from '../sequence/sequence-dialog';
import type { SequencePlayerOptions } from 'csdm/common/types/sequence-player-options';
import { useCurrentMatchSequences } from './use-current-match-sequences';
import { useCurrentMatch } from 'csdm/ui/match/use-current-match';
import { addSequence } from './sequences-actions';
import type { SequenceForm } from '../sequence/sequence-form';
import { useVideoSettings } from 'csdm/ui/settings/video/use-video-settings';

type Props = {
  isVisible: boolean;
  closeDialog: () => void;
};

export function AddSequenceDialog({ isVisible, closeDialog }: Props) {
  const match = useCurrentMatch();
  const sequences = useCurrentMatchSequences();
  const dispatch = useDispatch();
  const settings = useVideoSettings();

  const defaultPlayersOptions: SequencePlayerOptions[] = match.players.map((player) => {
    return {
      steamId: player.steamId,
      playerName: player.name,
      showKill: true,
      highlightKill: false,
      isVoiceEnabled: true,
    };
  });

  const onSaveClick = (sequenceForm: SequenceForm) => {
    const sequence: Sequence = {
      ...sequenceForm,
      startTick: Number(sequenceForm.startTick),
      endTick: Number(sequenceForm.endTick),
    };
    dispatch(addSequence({ demoFilePath: match.demoFilePath, sequence }));
  };

  const sequenceNumber = sequences.length + 1;
  const lastSequence = sequences.length > 0 ? sequences[sequences.length - 1] : undefined;
  let playersOptions = defaultPlayersOptions;
  let showXRay = settings.settings.showXRay;
  let playerVoicesEnabled = settings.settings.playerVoicesEnabled;
  let showOnlyDeathNotices = settings.settings.showOnlyDeathNotices;
  let deathNoticesDuration = settings.settings.deathNoticesDuration;
  if (lastSequence !== undefined) {
    playersOptions = lastSequence.playersOptions;
    showXRay = lastSequence.showXRay;
    playerVoicesEnabled = lastSequence.playerVoicesEnabled;
    showOnlyDeathNotices = lastSequence.showOnlyDeathNotices;
    deathNoticesDuration = lastSequence.deathNoticesDuration;
  }

  const tickrate = Math.round(match.tickrate);
  const [firstRound] = match.rounds;
  const sequence: Sequence = {
    number: sequenceNumber,
    startTick: firstRound ? firstRound.freezetimeEndTick : tickrate,
    endTick: firstRound ? firstRound.endTick : tickrate + 10,
    showOnlyDeathNotices,
    deathNoticesDuration,
    playersOptions,
    cameras: [],
    showXRay,
    playerVoicesEnabled,
  };

  return (
    <SequenceDialog
      initialSequence={sequence}
      isVisible={isVisible}
      closeDialog={closeDialog}
      onSaveClick={onSaveClick}
    />
  );
}
