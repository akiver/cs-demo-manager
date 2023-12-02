import { createReducer } from '@reduxjs/toolkit';
import { GrenadeName, type TeamNumber } from 'csdm/common/types/counter-strike';
import { fetchMatchSuccess } from 'csdm/ui/match/match-actions';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import {
  grenadeNameChanged,
  playersChanged,
  radarLevelChanged,
  roundsChanged,
  sidesChanged,
} from 'csdm/ui/match/grenades/finder/grenades-finder-actions';

export type GrenadesFinderState = {
  steamIds: string[];
  rounds: number[];
  grenadeName: GrenadeName;
  radarLevel: RadarLevel;
  sides: TeamNumber[];
};

const initialState: GrenadesFinderState = {
  grenadeName: GrenadeName.Smoke,
  rounds: [],
  steamIds: [],
  radarLevel: RadarLevel.Upper,
  sides: [],
};

export const grenadesFinderReducer = createReducer(initialState, (builder) => {
  return builder
    .addCase(grenadeNameChanged, (state, action) => {
      state.grenadeName = action.payload.grenadeName;
    })
    .addCase(playersChanged, (state, action) => {
      state.steamIds = action.payload.steamIds;
    })
    .addCase(roundsChanged, (state, action) => {
      state.rounds = action.payload.rounds;
    })
    .addCase(sidesChanged, (state, action) => {
      state.sides = action.payload.sides;
    })
    .addCase(radarLevelChanged, (state, action) => {
      state.radarLevel = action.payload.radarLevel;
    })
    .addCase(fetchMatchSuccess, () => {
      return initialState;
    });
});
