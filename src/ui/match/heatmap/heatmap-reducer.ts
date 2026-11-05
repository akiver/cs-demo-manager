import { createReducer } from '@reduxjs/toolkit';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import type { HeatmapTimeRange } from 'csdm/common/types/heatmap-time-range';
import type { BombPlantPhase } from 'csdm/common/types/bomb-plant-phase';
import {
  blurChanged,
  fetchPointsSuccess,
  opacityChanged,
  radiusChanged,
  timeRangeChanged,
} from 'csdm/ui/match/heatmap/match-heatmap-actions';
import { fetchMatchSuccess } from 'csdm/ui/match/match-actions';
import { RadarLevel } from 'csdm/ui/maps/radar-level';

export type MatchHeatmapState = {
  readonly radius: number;
  readonly blur: number;
  readonly alpha: number;
  readonly event: HeatmapEvent;
  readonly rounds: number[]; // empty => all rounds
  readonly sides: TeamNumber[]; // empty => all sides
  readonly steamIds: string[]; // empty => all players
  readonly teamNames: string[]; // empty => all teams
  readonly radarLevel: RadarLevel;
  readonly timeRange: HeatmapTimeRange;
  readonly plantPhase: BombPlantPhase | null; // null => whole round
};

const initialState: MatchHeatmapState = {
  radius: 10,
  blur: 20,
  alpha: 1,
  event: HeatmapEvent.Kills,
  rounds: [],
  sides: [],
  steamIds: [],
  teamNames: [],
  radarLevel: RadarLevel.Upper,
  timeRange: {
    startSeconds: 0,
    endSeconds: null,
  },
  plantPhase: null,
};

export const heatmapReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(opacityChanged, (state, action) => {
      state.alpha = action.payload;
    })
    .addCase(blurChanged, (state, action) => {
      state.blur = action.payload;
    })
    .addCase(radiusChanged, (state, action) => {
      state.radius = action.payload;
    })
    .addCase(timeRangeChanged, (state, action) => {
      state.timeRange = action.payload;
    })
    .addCase(fetchPointsSuccess, (state, action) => {
      state.event = action.payload.event;
      state.rounds = action.payload.rounds;
      state.sides = action.payload.sides;
      state.teamNames = action.payload.teamNames;
      state.steamIds = action.payload.steamIds;
      state.radarLevel = action.payload.radarLevel;
      state.timeRange = action.payload.timeRange;
      state.plantPhase = action.payload.plantPhase;
    })
    .addCase(fetchMatchSuccess, () => {
      return initialState;
    });
});
