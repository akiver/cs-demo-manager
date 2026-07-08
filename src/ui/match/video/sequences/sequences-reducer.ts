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
  swapSequences,
  updateSequence,
} from './sequences-actions';
import { buildPlayersEventSequences } from 'csdm/common/video/sequences/build-players-event-sequences';
import { PlayerSequenceEvent } from 'csdm/common/types/player-sequence-event';
import { buildPlayersRoundsSequences } from 'csdm/common/video/sequences/build-players-rounds-sequences';
import { getNextSequenceNumber } from 'csdm/common/video/sequences/get-next-sequence-number';
import { sortSequencesByNumber } from 'csdm/common/video/sequences/sort-sequences-by-number';

export type SequencesByDemoFilePath = { [demoFilePath: string]: Sequence[] | undefined };

const initialState: SequencesByDemoFilePath = {};

export const sequencesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addSequence, (state, action) => {
      const { sequence, demoFilePath } = action.payload;
      const sequences = state[demoFilePath] ?? [];
      sequences.push(sequence);
      state[demoFilePath] = sortSequencesByNumber(sequences);
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
        (sequence) => sequence.number === action.payload.previousNumber,
      );
      if (sequenceToUpdateIndex > -1) {
        sequences[sequenceToUpdateIndex] = action.payload.sequence;
        state[action.payload.demoFilePath] = sortSequencesByNumber(sequences);
      }
    })
    .addCase(swapSequences, (state, action) => {
      const { demoFilePath, currentNumber, newNumber } = action.payload;
      const sequences = state[demoFilePath] ?? [];
      const firstSequence = sequences.find((sequence) => sequence.number === currentNumber);
      const secondSequence = sequences.find((sequence) => sequence.number === newNumber);
      if (firstSequence !== undefined && secondSequence !== undefined) {
        firstSequence.number = newNumber;
        secondSequence.number = currentNumber;
        state[demoFilePath] = sortSequencesByNumber(sequences);
      }
    })
    .addCase(deleteSequences, (state, action) => {
      state[action.payload.demoFilePath] = [];
    })
    .addCase(replaceSequences, (state, action) => {
      state[action.payload.demoFilePath] = sortSequencesByNumber(action.payload.sequences);
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
        firstSequenceNumber: preserveExistingSequences ? getNextSequenceNumber(existingSequences) : 1,
      });
      if (preserveExistingSequences) {
        state[demoFilePath] = sortSequencesByNumber([...existingSequences, ...sequences]);
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
        firstSequenceNumber: preserveExistingSequences ? getNextSequenceNumber(existingSequences) : 1,
      });
      if (preserveExistingSequences) {
        state[demoFilePath] = sortSequencesByNumber([...existingSequences, ...sequences]);
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
        firstSequenceNumber: preserveExistingSequences ? getNextSequenceNumber(existingSequences) : 1,
      });
      if (preserveExistingSequences) {
        state[match.demoFilePath] = sortSequencesByNumber([...existingSequences, ...sequences]);
      } else {
        state[match.demoFilePath] = sequences;
      }
    });
});
