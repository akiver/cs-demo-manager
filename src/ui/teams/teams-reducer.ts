import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import type { TeamTable } from 'csdm/common/types/team-table';
import {
  fetchTeamsError,
  fetchTeamsStart,
  fetchTeamsSuccess,
  fuzzySearchTextChanged,
  selectionChanged,
} from './teams-actions';

type TeamsState = {
  readonly status: Status;
  readonly entities: TeamTable[];
  readonly selectedTeamNames: string[];
  readonly fuzzySearchText: string;
};

const initialState: TeamsState = {
  status: Status.Loading,
  entities: [],
  selectedTeamNames: [],
  fuzzySearchText: '',
};

export const teamsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchTeamsStart, (state) => {
      state.status = Status.Loading;
      state.entities = [];
    })
    .addCase(fetchTeamsSuccess, (state, action) => {
      state.status = Status.Success;
      state.entities = action.payload.teams;
    })
    .addCase(fetchTeamsError, (state) => {
      state.status = Status.Error;
    })
    .addCase(selectionChanged, (state, action) => {
      state.selectedTeamNames = action.payload.names;
    })
    .addCase(fuzzySearchTextChanged, (state, action) => {
      state.fuzzySearchText = action.payload.text;
    });
});
