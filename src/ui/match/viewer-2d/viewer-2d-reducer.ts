import { createReducer } from '@reduxjs/toolkit';
import { fetchMatchSuccess } from '../match-actions';
import {
  audioOffsetChanged,
  audioLoaded,
  focusedPlayerChanged,
  speedChanged,
  volumeChanged,
  resetAudioOffset,
} from './viewer-actions';

export type Viewer2DState = {
  speed: number;
  focusedPlayerId: string | undefined;
  audioOffsetSeconds: number; // How many seconds to apply to the possible audio playback, can be negative or positive
  volume: number;
};

const initialState: Viewer2DState = {
  speed: 1,
  focusedPlayerId: undefined,
  audioOffsetSeconds: 0,
  volume: 1,
};

export const viewer2DReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(focusedPlayerChanged, (state, action) => {
      state.focusedPlayerId = action.payload.focusedPlayerId;
    })
    .addCase(speedChanged, (state, action) => {
      state.speed = action.payload.speed;
    })
    .addCase(volumeChanged, (state, action) => {
      state.volume = action.payload.volume;
    })
    .addCase(audioLoaded, (state, action) => {
      state.audioOffsetSeconds = action.payload.offsetSeconds;
    })
    .addCase(audioOffsetChanged, (state, action) => {
      state.audioOffsetSeconds = action.payload.seconds;
    })
    .addCase(resetAudioOffset, (state) => {
      state.audioOffsetSeconds = 0;
    })
    .addCase(fetchMatchSuccess, () => {
      return initialState;
    });
});
