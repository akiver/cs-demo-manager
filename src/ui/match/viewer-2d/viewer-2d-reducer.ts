import { createReducer } from '@reduxjs/toolkit';
import { fetchMatchSuccess } from '../match-actions';
import { focusedPlayerChanged, speedChanged } from './viewer-actions';

export type Viewer2DState = {
  speed: number;
  focusedPlayerId: string | undefined;
};

const initialState: Viewer2DState = {
  speed: 1,
  focusedPlayerId: undefined,
};

export const viewer2DReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(focusedPlayerChanged, (state, action) => {
      state.focusedPlayerId = action.payload.focusedPlayerId;
    })
    .addCase(speedChanged, (state, action) => {
      state.speed = action.payload.speed;
    })
    .addCase(fetchMatchSuccess, () => {
      return initialState;
    });
});
