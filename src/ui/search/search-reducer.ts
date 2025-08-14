import { createReducer } from '@reduxjs/toolkit';
import type { DemoSource, WeaponName } from 'csdm/common/types/counter-strike';
import { Status } from 'csdm/common/types/status';
import { SearchEvent } from 'csdm/common/types/search/search-event';
import {
  periodChanged,
  mapRemoved,
  mapSelected,
  playerRemoved,
  playerSelected,
  searchError,
  searchStart,
  searchSuccess,
  searchEventChanged,
  demoSourcesChanged,
  roundTagIdsChanged,
  matchTagIdsChanged,
  victimSelected,
  victimRemoved,
  weaponNamesChanged,
} from './search-actions';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { SearchResult } from 'csdm/common/types/search/search-result';

type FinderState = {
  readonly status: Status;
  readonly event: SearchEvent;
  readonly result: SearchResult;
  readonly players: PlayerResult[];
  readonly victims: PlayerResult[];
  readonly mapNames: string[];
  readonly startDate: string | undefined;
  readonly endDate: string | undefined;
  readonly demoSources: DemoSource[];
  readonly roundTagIds: string[];
  readonly matchTagIds: string[];
  readonly weaponNames: WeaponName[];
};

const initialState: FinderState = {
  status: Status.Idle,
  event: SearchEvent.FiveKill,
  result: [],
  players: [],
  victims: [],
  mapNames: [],
  startDate: undefined,
  endDate: undefined,
  demoSources: [],
  roundTagIds: [],
  matchTagIds: [],
  weaponNames: [],
};

export const searchReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(searchEventChanged, (state, action) => {
      state.event = action.payload.event;
      state.status = Status.Idle;
      state.result = [];
    })
    .addCase(playerSelected, (state, action) => {
      if (!state.players.some((player) => player.steamId === action.payload.player.steamId)) {
        state.players.push(action.payload.player);
      }
    })
    .addCase(playerRemoved, (state, action) => {
      state.players = state.players.filter((player) => player.steamId !== action.payload.steamId);
    })
    .addCase(victimSelected, (state, action) => {
      if (!state.victims.some((victim) => victim.steamId === action.payload.victim.steamId)) {
        state.victims.push(action.payload.victim);
      }
    })
    .addCase(victimRemoved, (state, action) => {
      state.victims = state.victims.filter((victim) => victim.steamId !== action.payload.steamId);
    })
    .addCase(mapSelected, (state, action) => {
      if (!state.mapNames.includes(action.payload.mapName)) {
        state.mapNames.push(action.payload.mapName);
      }
    })
    .addCase(mapRemoved, (state, action) => {
      state.mapNames = state.mapNames.filter((mapName) => {
        return mapName !== action.payload.mapName;
      });
    })
    .addCase(demoSourcesChanged, (state, action) => {
      state.demoSources = action.payload.demoSources;
    })
    .addCase(roundTagIdsChanged, (state, action) => {
      state.roundTagIds = action.payload.tagIds;
    })
    .addCase(matchTagIdsChanged, (state, action) => {
      state.matchTagIds = action.payload.tagIds;
    })
    .addCase(weaponNamesChanged, (state, action) => {
      state.weaponNames = action.payload.weaponNames;
    })
    .addCase(periodChanged, (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    })
    .addCase(searchStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(searchSuccess, (state, action) => {
      state.status = Status.Success;
      state.result = action.payload.result;
    })
    .addCase(searchError, (state) => {
      state.status = Status.Error;
    });
});
