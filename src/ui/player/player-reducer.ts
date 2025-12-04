import { createReducer } from '@reduxjs/toolkit';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { deleteMatchesSuccess, matchesTypeUpdated } from 'csdm/ui/matches/matches-actions';
import { Status } from 'csdm/common/types/status';
import { checksumsTagsUpdated, playersTagsUpdated, tagDeleted } from 'csdm/ui/tags/tags-actions';
import type { PlayerProfile } from 'csdm/common/types/player-profile';
import { ErrorCode } from 'csdm/common/error-code';
import {
  fetchPlayerError,
  fetchPlayerStart,
  fetchPlayerSuccess,
  playerCommentUpdated,
  selectedMatchesChanged,
} from './player-actions';
import { demoRenamed } from '../demos/demos-actions';
import { HeatmapEvent } from 'csdm/common/types/heatmap-event';
import { RadarLevel } from '../maps/radar-level';
import type { TeamNumber } from 'csdm/common/types/counter-strike';
import { blurChanged, fetchPointsSuccess, opacityChanged, radiusChanged } from './heatmap/player-heatmap-actions';
import { isDefuseMapFromName } from 'csdm/common/counter-strike/is-defuse-map-from-name';

type HeatmapState = {
  readonly mapName: string;
  readonly radius: number;
  readonly blur: number;
  readonly alpha: number;
  readonly event: HeatmapEvent;
  readonly radarLevel: RadarLevel;
  readonly sides: TeamNumber[]; // empty => all sides
};

type PlayerState = {
  status: Status;
  errorCode: ErrorCode;
  player: PlayerProfile | undefined;
  selectedMatchChecksums: string[];
  heatmap: HeatmapState;
};

const initialState: PlayerState = {
  player: undefined,
  status: Status.Idle,
  errorCode: ErrorCode.UnknownError,
  selectedMatchChecksums: [],
  heatmap: {
    mapName: '',
    radius: 14,
    blur: 20,
    alpha: 1,
    event: HeatmapEvent.Kills,
    radarLevel: RadarLevel.Upper,
    sides: [],
  },
};

export const playerReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchPlayerStart, (state) => {
      state.status = Status.Loading;
    })
    .addCase(fetchPlayerSuccess, (state, action) => {
      state.status = Status.Success;
      state.player = action.payload;
      if (action.payload.mapsStats.length > 0) {
        const firstDefuseMap = action.payload.mapsStats.find((map) => isDefuseMapFromName(map.mapName));
        if (firstDefuseMap) {
          state.heatmap.mapName = firstDefuseMap.mapName;
        } else {
          state.heatmap.mapName = action.payload.mapsStats[0].mapName;
        }
      }
    })
    .addCase(fetchPlayerError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(deleteMatchesSuccess, (state, action) => {
      if (state.player) {
        state.player.matches = state.player.matches.filter(
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
      const match = state.player?.matches.find((match) => match.checksum === action.payload.checksum);
      if (match !== undefined) {
        match.comment = action.payload.comment;
      }
    })
    .addCase(playerCommentUpdated, (state, action) => {
      if (state.player?.steamId === action.payload.steamId) {
        state.player.comment = action.payload.comment;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      if (state.player !== undefined) {
        const matches = state.player.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.tagIds = action.payload.tagIds;
        }
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      if (state.player !== undefined) {
        const matches = state.player.matches.filter((match) => action.payload.checksums.includes(match.checksum));
        for (const match of matches) {
          match.type = action.payload.type;
        }
      }
    })
    .addCase(playersTagsUpdated, (state, action) => {
      if (state.player && action.payload.steamIds.includes(state.player.steamId)) {
        state.player.tagIds = action.payload.tagIds;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      if (state.player !== undefined) {
        const matches = state.player.matches.filter((match) => action.payload.checksum.includes(match.checksum));
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
