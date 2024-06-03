import { createReducer } from '@reduxjs/toolkit';
import type { TeamNumber } from '@akiver/cs-demo-analyzer';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { deleteMatchesSuccess, matchesTypeUpdated } from 'csdm/ui/matches/matches-actions';
import { Status } from 'csdm/common/types/status';
import { checksumsTagsUpdated, tagDeleted } from 'csdm/ui/tags/tags-actions';
import type { TeamProfile } from 'csdm/common/types/team-profile';
import { ErrorCode } from 'csdm/common/error-code';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { fetchTeamError, fetchTeamStart, fetchTeamSuccess, selectedMatchesChanged } from './team-actions';
import { RadarLevel } from 'csdm/ui/maps/radar-level';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { blurChanged, fetchPointsSuccess, opacityChanged, radiusChanged } from './heatmap/team-heatmap-actions';

type HeatmapState = {
  readonly mapName: string;
  readonly radius: number;
  readonly blur: number;
  readonly alpha: number;
  readonly event: HeatmapEvent;
  readonly radarLevel: RadarLevel;
  readonly sides: TeamNumber[]; // empty => all sides
};

type TeamState = {
  status: Status;
  errorCode: ErrorCode;
  team: TeamProfile | undefined;
  selectedMatchChecksums: string[];
  heatmap: HeatmapState;
};

const initialState: TeamState = {
  team: undefined,
  status: Status.Idle,
  errorCode: ErrorCode.UnknownError,
  selectedMatchChecksums: [],
  heatmap: {
    mapName: '',
    radius: 4,
    blur: 20,
    alpha: 1,
    event: HeatmapEvent.Kills,
    radarLevel: RadarLevel.Upper,
    sides: [],
  },
};

export const teamReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchTeamStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(fetchTeamSuccess, (state, action) => {
      state.status = Status.Success;
      state.team = action.payload;
      if (action.payload.mapsStats.length > 0) {
        const firstDefuseMap = action.payload.mapsStats.find((map) => map.mapName.startsWith('de_'));
        if (firstDefuseMap) {
          state.heatmap.mapName = firstDefuseMap.mapName;
        } else {
          state.heatmap.mapName = action.payload.mapsStats[0].mapName;
        }
      }
    })
    .addCase(fetchTeamError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(deleteMatchesSuccess, (state, action) => {
      if (state.team) {
        state.team.matches = state.team.matches.filter(
          (match) => !action.payload.deletedChecksums.includes(match.checksum),
        );
      }
      state.selectedMatchChecksums = state.selectedMatchChecksums.filter(
        (checksum) => !action.payload.deletedChecksums.includes(checksum),
      );
    })
    .addCase(selectedMatchesChanged, (state, action) => {
      state.selectedMatchChecksums = action.payload.selectedChecksums;
    })
    .addCase(commentUpdated, (state, action) => {
      const match = state.team?.matches.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.comment = action.payload.comment;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.tagIds = action.payload.tagIds;
        }
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.type = action.payload.type;
        }
      }
    })
    .addCase(demoRenamed, (state, action) => {
      if (state.team !== undefined) {
        const matches = state.team.matches.filter((match) => action.payload.checksum.includes(match.checksum));
        for (const match of matches) {
          match.name = action.payload.name;
        }
      }
    })
    .addCase(opacityChanged, (state, action) => {
      state.heatmap.alpha = action.payload;
    })
    .addCase(blurChanged, (state, action) => {
      state.heatmap.blur = action.payload;
    })
    .addCase(radiusChanged, (state, action) => {
      state.heatmap.radius = action.payload;
    })
    .addCase(fetchPointsSuccess, (state, action) => {
      if (state.heatmap.mapName !== action.payload.mapName) {
        state.heatmap.radarLevel = RadarLevel.Upper;
      } else {
        state.heatmap.radarLevel = action.payload.radarLevel;
      }
      state.heatmap.event = action.payload.event;
      state.heatmap.mapName = action.payload.mapName;
      state.heatmap.sides = action.payload.sides;
    })
    .addCase(tagDeleted, () => {
      return initialState;
    });
});
