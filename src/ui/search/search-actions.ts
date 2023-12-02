import { createAction } from '@reduxjs/toolkit';
import type { DemoSource } from 'csdm/common/types/counter-strike';
import type { ErrorCode } from 'csdm/common/error-code';
import type { SearchEvent } from 'csdm/common/types/search/search-event';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { SearchResult } from 'csdm/common/types/search/search-result';

export const searchEventChanged = createAction<{ event: SearchEvent }>('search/searchEventChanged');
export const playerSelected = createAction<{ player: PlayerResult }>('search/playerSelected');
export const playerRemoved = createAction<{ steamId: string }>('search/playerRemoved');
export const mapSelected = createAction<{ mapName: string }>('search/mapSelected');
export const mapRemoved = createAction<{ mapName: string }>('search/mapRemoved');
export const demoSourcesChanged = createAction<{ demoSources: DemoSource[] }>('search/sourcesChanged');
export const periodChanged = createAction<{ startDate: string | undefined; endDate: string | undefined }>(
  'search/periodChanged',
);
export const searchStart = createAction('search/searchStart');
export const searchSuccess = createAction<{ result: SearchResult }>('search/searchSuccess');
export const searchError = createAction<{ errorCode: ErrorCode }>('search/searchError');
