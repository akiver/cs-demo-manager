import { createAction } from '@reduxjs/toolkit';
import type { PlayerTable } from 'csdm/common/types/player-table';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';

export const fetchPlayersStart = createAction<{ filter: PlayersTableFilter }>('players/fetchStart');
export const fetchPlayersSuccess = createAction<{ players: PlayerTable[] }>('players/fetchSuccess');
export const fetchPlayersError = createAction('players/fetchError');
export const selectionChanged = createAction<{ steamIds: string[] }>('players/selectionChanged');
export const fuzzySearchTextChanged = createAction<{ text: string }>('players/fuzzySearchTextChanged');
