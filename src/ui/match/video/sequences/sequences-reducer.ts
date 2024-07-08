import type { Sequence } from 'csdm/common/types/sequence';
import { createReducer } from '@reduxjs/toolkit';
import {
  addSequence,
  deleteSequence,
  deleteSequences,
  generatePlayerKillsSequences,
  generatePlayerRoundsSequences,
  generatePlayerSequences,
  updateSequence,
} from './sequences-actions';
import { buildPlayerEventSequences } from './build-player-event-sequences';
import { buildPlayerRoundsSequences } from './build-player-rounds-sequences';
import { PlayerSequenceEvent } from './player-sequence-event';
import { assertNever } from 'csdm/common/assert-never';

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
    .addCase(generatePlayerKillsSequences, (state, action) => {
      const { match, steamId } = action.payload;
      const sequences = buildPlayerEventSequences(PlayerSequenceEvent.Kills, match, steamId);
      state[match.demoFilePath] = sequences;
    })
    .addCase(generatePlayerSequences, (state, action) => {
      const { match, steamId, event, weapons } = action.payload;
      switch (event) {
        case PlayerSequenceEvent.Rounds: {
          state[match.demoFilePath] = buildPlayerRoundsSequences(match, steamId);
          break;
        }
        case PlayerSequenceEvent.Kills:
        case PlayerSequenceEvent.Deaths: {
          state[match.demoFilePath] = buildPlayerEventSequences(event, match, steamId, weapons);
          break;
        }
        default:
          return assertNever(event, `Unknown player sequence event: ${event}`);
      }
    })
    .addCase(generatePlayerRoundsSequences, (state, action) => {
      const { match, steamId } = action.payload;
      const sequences = buildPlayerRoundsSequences(match, steamId);
      state[match.demoFilePath] = sequences;
    });
});
