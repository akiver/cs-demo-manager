import { createReducer } from '@reduxjs/toolkit';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { deleteMatchesSuccess, matchesTypeUpdated } from 'csdm/ui/matches/matches-actions';
import { Status } from 'csdm/common/types/status';
import { checksumsTagsUpdated, tagDeleted } from 'csdm/ui/tags/tags-actions';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import { ErrorCode } from 'csdm/common/error-code';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { fetchTeamError, fetchTeamStart, fetchTeamSuccess, selectedMatchesChanged } from './team-actions';

type TeamState = {
  status: Status;
  errorCode: ErrorCode;
  team: TeamProfile | undefined;
  selectedMatchChecksums: string[];
};

const initialState: TeamState = {
  team: undefined,
  status: Status.Idle,
  errorCode: ErrorCode.UnknownError,
  selectedMatchChecksums: [],
};

export const teamReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchTeamStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(fetchTeamSuccess, (state, action) => {
      state.status = Status.Success;
      state.team = action.payload;
    })
    .addCase(fetchTeamError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(deleteMatchesSuccess, (state, action) => {
      if (state.team) {
        state.team.matches = state.team.matches.filter(
          (match) => !action.payload.deletedChecksums.includes(match.checksum),
        );
      }
      state.selectedMatchChecksums = state.selectedMatchChecksums.filter(
        (checksum) => !action.payload.deletedChecksums.includes(checksum),
      );
    })
    .addCase(selectedMatchesChanged, (state, action) => {
      state.selectedMatchChecksums = action.payload.selectedChecksums;
    })
    .addCase(commentUpdated, (state, action) => {
      const match = state.team?.matches.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.comment = action.payload.comment;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.tagIds = action.payload.tagIds;
        }
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.type = action.payload.type;
        }
      }
    })
    .addCase(demoRenamed, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksum.includes(match.checksum));
        for (const match of matches) {
          match.name = action.payload.name;
        }
      }
    })
    .addCase(tagDeleted, () => {
      return initialState;
    });
});
