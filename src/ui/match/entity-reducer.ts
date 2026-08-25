import { createReducer } from '@reduxjs/toolkit';
import { fetchMatchError, fetchMatchStart, fetchMatchSuccess, updateMatchDemoLocationSuccess } from './match-actions';
import type { Match } from 'csdm/common/types/match';
import { Status } from 'csdm/common/types/status';
import type { ErrorCode } from 'csdm/common/error-code';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { checksumsTagsUpdated, playersTagsUpdated, roundTagsUpdated } from 'csdm/ui/tags/tags-actions';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { addIgnoredSteamAccountSuccess, deleteIgnoredSteamAccountSuccess } from '../ban/ban-actions';
import { insertMatchSuccess } from '../analyses/analyses-actions';
import { matchesTypeUpdated } from '../matches/matches-actions';
import { steamAccountNameUpdated } from '../player/player-actions';
import { roundCommentUpdated } from './rounds/round/round-actions';

type EntityState = {
  match: Match | null;
  status: Status;
  errorCode: ErrorCode | null;
};

const initialState: EntityState = {
  match: null,
  status: Status.Loading,
  errorCode: null,
};

export const entityReducer = createReducer(initialState, (builder) => {
  return builder
    .addCase(fetchMatchStart, (state) => {
      state.status = Status.Loading;
      state.errorCode = null;
    })
    .addCase(fetchMatchSuccess, (state, action) => {
      state.match = action.payload.match;
      state.status = Status.Success;
      state.errorCode = null;
    })
    .addCase(fetchMatchError, (state, action) => {
      state.status = Status.Error;
      state.errorCode = action.payload.errorCode;
    })
    .addCase(commentUpdated, (state, action) => {
      const match = state.match;
      if (match?.checksum === action.payload.checksum) {
        match.comment = action.payload.comment;
      }
    })
    .addCase(roundCommentUpdated, (state, action) => {
      const match = state.match;
      if (match === null || action.payload.checksum !== match.checksum) {
        return;
      }
      const round = match.rounds.find((round) => round.number === action.payload.number);
      if (round) {
        round.comment = action.payload.comment;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      const match = state.match;
      if (match?.checksum === action.payload.checksum) {
        match.name = action.payload.name;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      const match = state.match;
      if (match !== null && action.payload.checksums.includes(match.checksum)) {
        match.tagIds = action.payload.tagIds;
      }
    })
    .addCase(playersTagsUpdated, (state, action) => {
      const match = state.match;
      if (match === null) {
        return;
      }

      for (const player of match.players) {
        if (action.payload.steamIds.includes(player.steamId)) {
          player.tagIds = action.payload.tagIds;
        }
      }
    })
    .addCase(roundTagsUpdated, (state, action) => {
      const match = state.match;
      if (match?.checksum !== action.payload.checksum) {
        return;
      }

      const round = match.rounds.find((round) => round.number === action.payload.roundNumber);
      if (round) {
        round.tagIds = action.payload.tagIds;
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      const match = state.match;
      if (match !== null && action.payload.checksums.includes(match.checksum)) {
        match.type = action.payload.type;
      }
    })
    .addCase(updateMatchDemoLocationSuccess, (state, action) => {
      if (state.match !== null) {
        state.match.demoFilePath = action.payload.demoFilePath;
      }
    })
    .addCase(addIgnoredSteamAccountSuccess, (state, action) => {
      for (const player of state.match?.players ?? []) {
        if (action.payload.account.steamId === player.steamId) {
          player.lastBanDate = null;
        }
      }
    })
    .addCase(deleteIgnoredSteamAccountSuccess, (state, action) => {
      for (const player of state.match?.players ?? []) {
        if (action.payload.account.steamId === player.steamId) {
          player.lastBanDate = action.payload.account.lastBanDate;
        }
      }
    })
    .addCase(insertMatchSuccess, (state, action) => {
      if (state.match?.checksum === action.payload.checksum) {
        state.match = null;
        state.status = Status.Loading;
      }
    })
    .addCase(steamAccountNameUpdated, (state, action) => {
      const match = state.match;
      if (match === null) {
        return;
      }

      const { name } = action.payload;

      for (const player of match.players) {
        if (player.steamId === action.payload.steamId) {
          player.name = name;
        }
      }

      for (const kill of match.kills) {
        if (kill.killerSteamId === action.payload.steamId) {
          kill.killerName = name;
        }
        if (kill.assisterSteamId === action.payload.steamId) {
          kill.assisterName = name;
        }
        if (kill.victimSteamId === action.payload.steamId) {
          kill.victimName = name;
        }
      }

      for (const chat of match.chatMessages) {
        if (chat.senderSteamId === action.payload.steamId) {
          chat.senderName = name;
        }
      }
    });
});
