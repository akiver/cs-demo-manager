import { createAction } from '@reduxjs/toolkit';
import type { TeamTable } from 'csdm/common/types/team-table';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';

export const fetchTeamsStart = createAction<{ filter: TeamsTableFilter }>('teams/fetchStart');
export const fetchTeamsSuccess = createAction<{ teams: TeamTable[] }>('teams/fetchSuccess');
export const fetchTeamsError = createAction('teams/fetchError');
export const selectionChanged = createAction<{ names: string[] }>('teams/selectionChanged');
export const fuzzySearchTextChanged = createAction<{ text: string }>('teams/fuzzySearchTextChanged');
