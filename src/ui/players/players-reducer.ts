import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import type { PlayerTable } from 'csdm/common/types/player-table';
import {
  fetchPlayersError,
  fetchPlayersStart,
  fetchPlayersSuccess,
  fuzzySearchTextChanged,
  selectionChanged,
} from './players-actions';
import { playerCommentUpdated } from '../player/player-actions';

export type PlayersState = {
  readonly status: Status;
  readonly entities: PlayerTable[];
  readonly selectedPlayerSteamIds: string[];
  readonly fuzzySearchText: string;
};

const initialState: PlayersState = {
  status: Status.Loading,
  entities: [],
  selectedPlayerSteamIds: [],
  fuzzySearchText: '',
};

export const playersReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchPlayersStart, (state) => {
      state.status = Status.Loading;
      state.entities = [];
    })
    .addCase(fetchPlayersSuccess, (state, action) => {
      state.status = Status.Success;
      state.entities = action.payload.players;
    })
    .addCase(fetchPlayersError, (state) => {
      state.status = Status.Error;
    })
    .addCase(selectionChanged, (state, action) => {
      state.selectedPlayerSteamIds = action.payload.steamIds;
    })
    .addCase(fuzzySearchTextChanged, (state, action) => {
      state.fuzzySearchText = action.payload.text;
    })
    .addCase(playerCommentUpdated, (state, action) => {
      const player = state.entities.find((p) => p.steamId === action.payload.steamId);
      if (player) {
        player.comment = action.payload.comment;
      }
    });
});
