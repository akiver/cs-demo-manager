import { createReducer } from '@reduxjs/toolkit';
import { deleteMatchesSuccess } from 'csdm/ui/matches/matches-actions';
import { insertMatchSuccess } from 'csdm/ui/analyses/analyses-actions';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { fetchDemosSuccess } from 'csdm/ui/demos/demos-actions';

type State = {
  readonly matchChecksums: string[];
};

const initialState: State = { matchChecksums: [] };

// The purpose of this redux state is to reduces queries to the db.
// It's populated at app initialization and updated when the user do a CRUD action on entities.
export const cacheReducer = createReducer(initialState, (builder) => {
  return (
    builder
      .addCase(initializeAppSuccess, (state, action) => {
        state.matchChecksums = action.payload.matchChecksums;
      })
      // The database may have been modified by another process (e.g. a CLI analysis), refreshing the demos also
      // refreshes the checksums cache so demos analyzed outside the application are reported as analyzed.
      .addCase(fetchDemosSuccess, (state, action) => {
        state.matchChecksums = action.payload.matchChecksums;
      })
      .addCase(insertMatchSuccess, (state, action) => {
        if (!state.matchChecksums.includes(action.payload.checksum)) {
          state.matchChecksums.push(action.payload.checksum);
        }
      })
      .addCase(deleteMatchesSuccess, (state, action) => {
        const { deletedChecksums } = action.payload;
        state.matchChecksums = state.matchChecksums.filter((checksum) => {
          return !deletedChecksums.includes(checksum);
        });
      })
  );
});
