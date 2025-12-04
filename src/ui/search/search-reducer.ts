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
  headshotChanged,
  noScopeChanged,
  wallbangChanged,
  jumpChanged,
  throughSmokeChanged,
  teamKillChanged,
  collateralKillChanged,
} from './search-actions';
import type { PlayerResult } from 'csdm/common/types/search/player-result';
import type { SearchResult } from 'csdm/common/types/search/search-result';
import { roundCommentUpdated } from '../match/rounds/round/round-actions';
import { TriStateFilter } from 'csdm/common/types/tri-state-filter';

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
  readonly headshot: TriStateFilter;
  readonly noScope: TriStateFilter;
  readonly wallbang: TriStateFilter;
  readonly jump: TriStateFilter;
  readonly throughSmoke: TriStateFilter;
  readonly teamKill: TriStateFilter;
  readonly collateralKill: TriStateFilter;
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
  headshot: TriStateFilter.All,
  noScope: TriStateFilter.All,
  wallbang: TriStateFilter.All,
  jump: TriStateFilter.All,
  throughSmoke: TriStateFilter.All,
  teamKill: TriStateFilter.All,
  collateralKill: TriStateFilter.All,
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
    .addCase(headshotChanged, (state, action) => {
      state.headshot = action.payload.headshot;
    })
    .addCase(noScopeChanged, (state, action) => {
      state.noScope = action.payload.noScope;
    })
    .addCase(wallbangChanged, (state, action) => {
      state.wallbang = action.payload.wallbang;
    })
    .addCase(jumpChanged, (state, action) => {
      state.jump = action.payload.jump;
    })
    .addCase(throughSmokeChanged, (state, action) => {
      state.throughSmoke = action.payload.throughSmoke;
    })
    .addCase(teamKillChanged, (state, action) => {
      state.teamKill = action.payload.teamKill;
    })
    .addCase(collateralKillChanged, (state, action) => {
      state.collateralKill = action.payload.collateralKill;
    })
    .addCase(periodChanged, (state, action) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    })
    .addCase(roundCommentUpdated, (state, action) => {
      for (const result of state.result) {
        if (result.matchChecksum !== action.payload.checksum) {
          continue;
        }

        if ('comment' in result && result.number === action.payload.number) {
          result.comment = action.payload.comment;
        } else if ('roundComment' in result && result.roundNumber === action.payload.number) {
          result.roundComment = action.payload.comment;
        }
      }
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
