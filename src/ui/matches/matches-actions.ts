import { createAction } from '@reduxjs/toolkit';
import type { DemoType } from 'csdm/common/types/counter-strike';
import type { MatchTable } from 'csdm/common/types/match-table';

export const fetchMatchesStart = createAction('matches/fetchStart');
export const fetchMatchesSuccess = createAction<{
  matches: MatchTable[];
}>('matches/fetchSuccess');
export const fetchMatchesError = createAction('matches/fetchError');
export const selectedMatchesChanged = createAction<{ selectedChecksums: string[] }>('matches/selectionChanged');
export const deleteMatchesSuccess = createAction<{ deletedChecksums: string[] }>('matches/deleteSuccess');
export const fuzzySearchTextChanged = createAction<{ text: string }>('matches/fuzzySearchTextChanged');
export const matchesTypeUpdated = createAction<{ checksums: string[]; type: DemoType }>('matches/typeUpdated');
