import { createReducer } from '@reduxjs/toolkit';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import type { Perspective } from 'csdm/common/types/perspective';
import type { PlayerSequenceEvent } from 'csdm/common/types/player-sequence-event';
import { playerSequencesOptionsChanged } from './sequences-actions';

// Last options used in the "Generate player's sequences" dialog, restored the next time it's opened for the same demo.
export type PlayerSequencesOptions = {
  event: PlayerSequenceEvent;
  steamIds: string[];
  rounds: number[];
  perspective: Perspective;
  weapons: WeaponName[];
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  preserveExistingSequences: boolean;
};

export type PlayerSequencesOptionsByDemoFilePath = { [demoFilePath: string]: PlayerSequencesOptions | undefined };

const initialState: PlayerSequencesOptionsByDemoFilePath = {};

export const playerSequencesOptionsReducer = createReducer(initialState, (builder) => {
  builder.addCase(playerSequencesOptionsChanged, (state, action) => {
    state[action.payload.demoFilePath] = action.payload.options;
  });
});
