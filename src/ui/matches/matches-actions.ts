import { createAction } from '@reduxjs/toolkit';
import type { DemoType } from 'csdm/common/types/counter-strike';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { MatchesTeamNamesUpdatedPayload } from 'csdm/server/handlers/renderer-process/match/update-matches-team-names-handler';

export const fetchMatchesStart = createAction('matches/fetchStart');
export const fetchMatchesSuccess = createAction<{
  matches: MatchTable[];
}>('matches/fetchSuccess');
export const fetchMatchesError = createAction('matches/fetchError');
export const selectedMatchesChanged = createAction<{ selectedChecksums: string[] }>('matches/selectionChanged');
export const deleteMatchesSuccess = createAction<{ deletedChecksums: string[] }>('matches/deleteSuccess');
export const fuzzySearchTextChanged = createAction<{ text: string }>('matches/fuzzySearchTextChanged');
export const matchesTypeUpdated = createAction<{ checksums: string[]; type: DemoType }>('matches/typeUpdated');
export const teamNamesUpdated = createAction<MatchesTeamNamesUpdatedPayload>('matches/teamNamesUpdated');
