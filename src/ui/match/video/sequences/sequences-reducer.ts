import type { Sequence } from 'csdm/common/types/sequence';
import { createReducer } from '@reduxjs/toolkit';
import {
  addSequence,
  deleteSequence,
  deleteSequences,
  generatePlayerDeathsSequences,
  generatePlayerKillsSequences,
  generatePlayerRoundsSequences,
  replaceSequences,
  updateSequence,
} from './sequences-actions';
import { buildPlayerEventSequences } from './build-player-event-sequences';
import { buildPlayerRoundsSequences } from './build-player-rounds-sequences';
import { PlayerSequenceEvent } from './player-sequence-event';

export type SequencesByDemoFilePath = { [demoFilePath: string]: Sequence[] | undefined };

const initialState: SequencesByDemoFilePath = {};

export const sequencesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(addSequence, (state, action) => {
      const { sequence, demoFilePath } = action.payload;
      const sequences = state[demoFilePath] ?? [];
      const sequenceAlreadyExists = sequences.some(({ number, startTick, endTick }) => {
        return number === sequence.number || (startTick === sequence.startTick && endTick === sequence.endTick);
      });
      if (sequenceAlreadyExists) {
        return;
      }

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
    .addCase(generatePlayerKillsSequences, (state, action) => {
      const { match, steamId, weapons, perspective, settings } = action.payload;
      const sequences = buildPlayerEventSequences({
        event: PlayerSequenceEvent.Kills,
        match,
        steamId,
        perspective,
        weapons,
        settings,
      });
      state[match.demoFilePath] = sequences;
    })
    .addCase(generatePlayerDeathsSequences, (state, action) => {
      const { match, steamId, weapons, perspective, settings } = action.payload;
      const sequences = buildPlayerEventSequences({
        event: PlayerSequenceEvent.Deaths,
        match,
        steamId,
        perspective,
        weapons,
        settings,
      });
      state[match.demoFilePath] = sequences;
    })
    .addCase(generatePlayerRoundsSequences, (state, action) => {
      const { match, steamId, settings } = action.payload;
      const sequences = buildPlayerRoundsSequences(match, steamId, 0, 0, settings);
      state[match.demoFilePath] = sequences;
    });
});
