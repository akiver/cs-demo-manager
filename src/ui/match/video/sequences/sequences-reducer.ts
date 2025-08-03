import type { Sequence } from 'csdm/common/types/sequence';
import { createReducer } from '@reduxjs/toolkit';
import {
  addSequence,
  deleteSequence,
  deleteSequences,
  generatePlayersDeathsSequences,
  generatePlayersKillsSequences,
  generatePlayersRoundsSequences,
  replaceSequences,
  updateSequence,
} from './sequences-actions';
import { buildPlayersEventSequences } from './build-players-event-sequences';
import { buildPlayersRoundsSequences } from './build-players-rounds-sequences';
import { PlayerSequenceEvent } from './player-sequence-event';

export type SequencesByDemoFilePath = { [demoFilePath: string]: Sequence[] | undefined };

const initialState: SequencesByDemoFilePath = {};

export const sequencesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addSequence, (state, action) => {
      const { sequence, demoFilePath } = action.payload;
      const sequences = state[demoFilePath] ?? [];
      sequences.push(sequence);
      state[demoFilePath] = sequences;
    })
    .addCase(deleteSequence, (state, action) => {
      const sequences = state[action.payload.demoFilePath] ?? [];
      state[action.payload.demoFilePath] = sequences.filter(
        (sequence) => sequence.number !== action.payload.sequence.number,
      );
    })
    .addCase(updateSequence, (state, action) => {
      const sequences = state[action.payload.demoFilePath] ?? [];
      const sequenceToUpdateIndex = sequences.findIndex(
        (sequence) => sequence.number === action.payload.sequence.number,
      );
      if (sequenceToUpdateIndex > -1) {
        sequences[sequenceToUpdateIndex] = action.payload.sequence;
      }
    })
    .addCase(deleteSequences, (state, action) => {
      state[action.payload.demoFilePath] = [];
    })
    .addCase(replaceSequences, (state, action) => {
      state[action.payload.demoFilePath] = action.payload.sequences;
    })
    .addCase(generatePlayersKillsSequences, (state, action) => {
      const {
        match: { demoFilePath },
        preserveExistingSequences,
      } = action.payload;
      const existingSequences = state[demoFilePath] ?? [];
      const sequences = buildPlayersEventSequences({
        event: PlayerSequenceEvent.Kills,
        ...action.payload,
        firstSequenceNumber: preserveExistingSequences ? existingSequences.length + 1 : 1,
      });
      if (preserveExistingSequences) {
        state[demoFilePath] = [...existingSequences, ...sequences];
      } else {
        state[demoFilePath] = sequences;
      }
    })
    .addCase(generatePlayersDeathsSequences, (state, action) => {
      const {
        match: { demoFilePath },
        preserveExistingSequences,
      } = action.payload;
      const existingSequences = state[demoFilePath] ?? [];
      const sequences = buildPlayersEventSequences({
        event: PlayerSequenceEvent.Deaths,
        ...action.payload,
        firstSequenceNumber: preserveExistingSequences ? existingSequences.length + 1 : 1,
      });
      if (preserveExistingSequences) {
        state[demoFilePath] = [...existingSequences, ...sequences];
      } else {
        state[demoFilePath] = sequences;
      }
    })
    .addCase(generatePlayersRoundsSequences, (state, action) => {
      const { match, steamIds, settings, startSecondsBeforeEvent, endSecondsAfterEvent, preserveExistingSequences } =
        action.payload;
      const existingSequences = state[match.demoFilePath] ?? [];
      const sequences = buildPlayersRoundsSequences({
        match,
        steamIds,
        rounds: action.payload.rounds,
        startSecondsBeforeEvent,
        endSecondsAfterEvent,
        settings,
        firstSequenceNumber: preserveExistingSequences ? existingSequences.length + 1 : 1,
      });
      if (preserveExistingSequences) {
        state[match.demoFilePath] = [...existingSequences, ...sequences];
      } else {
        state[match.demoFilePath] = sequences;
      }
    });
});
