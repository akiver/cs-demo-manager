import { createReducer } from '@reduxjs/toolkit';
import { Status } from 'csdm/common/types/status';
import type { MatchTable } from 'csdm/common/types/match-table';
import { updateMatchDemoLocationSuccess } from 'csdm/ui/match/match-actions';
import { demosAddedToAnalyses, insertMatchSuccess } from 'csdm/ui/analyses/analyses-actions';
import {
  deleteMatchesSuccess,
  fetchMatchesError,
  fetchMatchesStart,
  fetchMatchesSuccess,
  fuzzySearchTextChanged,
  matchesTypeUpdated,
  selectedMatchesChanged,
  teamNamesUpdated,
} from './matches-actions';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { checksumsTagsUpdated, tagDeleted } from 'csdm/ui/tags/tags-actions';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { addIgnoredSteamAccountSuccess, deleteIgnoredSteamAccountSuccess } from '../ban/ban-actions';
import { initializeAppSuccess } from '../bootstrap/bootstrap-actions';

type MatchesState = {
  readonly status: Status;
  readonly entities: MatchTable[];
  readonly selectedChecksums: string[];
  readonly fuzzySearchText: string;
};

const initialState: MatchesState = {
  status: Status.Idle,
  entities: [],
  selectedChecksums: [],
  fuzzySearchText: '',
};

export const matchesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchMatchesStart, (state) => {
      state.entities = [];
      state.status = Status.Loading;
    })
    .addCase(fetchMatchesSuccess, (state, action) => {
      const { matches } = action.payload;
      state.entities = matches;
      state.status = Status.Success;
    })
    .addCase(fetchMatchesError, (state) => {
      state.status = Status.Error;
    })
    .addCase(selectedMatchesChanged, (state, action) => {
      state.selectedChecksums = action.payload.selectedChecksums;
    })
    .addCase(deleteMatchesSuccess, (state, action) => {
      const { deletedChecksums } = action.payload;
      state.entities = state.entities.filter((match) => !deletedChecksums.includes(match.checksum));
      state.selectedChecksums = state.selectedChecksums.filter((checksum) => !deletedChecksums.includes(checksum));
    })
    .addCase(fuzzySearchTextChanged, (state, action) => {
      state.fuzzySearchText = action.payload.text;
    })
    .addCase(updateMatchDemoLocationSuccess, (state, action) => {
      const match = state.entities.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.demoFilePath = action.payload.demoFilePath;
      }
    })
    .addCase(commentUpdated, (state, action) => {
      const match = state.entities.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.comment = action.payload.comment;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      const match = state.entities.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.name = action.payload.name;
      }
    })
    .addCase(demosAddedToAnalyses, (state, action) => {
      state.entities = state.entities.filter((match) => {
        return action.payload.some((analysis) => analysis.demoChecksum !== match.checksum);
      });
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      const matches = state.entities.filter((match) => action.payload.checksums.includes(match.checksum));
      for (const match of matches) {
        match.tagIds = action.payload.tagIds;
      }
    })
    .addCase(teamNamesUpdated, (state, action) => {
      for (const [checksum, names] of Object.entries(action.payload)) {
        const match = state.entities.find((match) => match.checksum === checksum);
        if (match) {
          match.teamAName = names.teamNameA;
          match.teamBName = names.teamNameB;
        }
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      const matches = state.entities.filter((match) => action.payload.checksums.includes(match.checksum));
      for (const match of matches) {
        match.type = action.payload.type;
      }
    })
    .addCase(insertMatchSuccess, (state, action) => {
      const matchIndex = state.entities.findIndex((match) => match.checksum === action.payload.checksum);
      if (matchIndex > -1) {
        state.entities[matchIndex] = action.payload;
      } else {
        state.entities.push(action.payload);
      }
    })
    .addCase(addIgnoredSteamAccountSuccess, () => {
      return initialState;
    })
    .addCase(deleteIgnoredSteamAccountSuccess, () => {
      return initialState;
    })
    .addCase(initializeAppSuccess, () => {
      return initialState;
    })
    .addCase(tagDeleted, () => {
      return initialState;
    });
});
