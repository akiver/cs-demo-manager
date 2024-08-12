import { createReducer } from '@reduxjs/toolkit';
import { fetchMatchSuccess, updateMatchDemoLocationSuccess } from './match-actions';
import type { Match } from 'csdm/common/types/match';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { checksumsTagsUpdated, playersTagsUpdated, roundTagsUpdated } from 'csdm/ui/tags/tags-actions';
import { demoRenamed } from 'csdm/ui/demos/demos-actions';
import { addIgnoredSteamAccountSuccess, deleteIgnoredSteamAccountSuccess } from '../ban/ban-actions';
import { insertMatchSuccess } from '../analyses/analyses-actions';
import { matchesTypeUpdated } from '../matches/matches-actions';
import { steamAccountNameUpdated } from '../player/player-actions';

const initialState = null as Match | null;

export const entityReducer = createReducer(initialState, (builder) => {
  return builder
    .addCase(fetchMatchSuccess, (state, action) => {
      return action.payload.match;
    })
    .addCase(commentUpdated, (state, action) => {
      if (state?.checksum === action.payload.checksum) {
        state.comment = action.payload.comment;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      if (state?.checksum === action.payload.checksum) {
        state.name = action.payload.name;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      if (state !== null && action.payload.checksums.includes(state.checksum)) {
        state.tagIds = action.payload.tagIds;
      }
    })
    .addCase(playersTagsUpdated, (state, action) => {
      if (!state) {
        return;
      }

      for (const player of state.players) {
        if (action.payload.steamIds.includes(player.steamId)) {
          player.tagIds = action.payload.tagIds;
        }
      }
    })
    .addCase(roundTagsUpdated, (state, action) => {
      if (state?.checksum !== action.payload.checksum) {
        return;
      }

      const round = state.rounds.find((round) => round.number === action.payload.roundNumber);
      if (round) {
        round.tagIds = action.payload.tagIds;
      }
    })
    .addCase(matchesTypeUpdated, (state, action) => {
      if (state !== null && action.payload.checksums.includes(state.checksum)) {
        state.type = action.payload.type;
      }
    })
    .addCase(updateMatchDemoLocationSuccess, (state, action) => {
      if (state !== null) {
        state.demoFilePath = action.payload.demoFilePath;
      }
    })
    .addCase(addIgnoredSteamAccountSuccess, (state, action) => {
      for (const player of state?.players ?? []) {
        if (action.payload.account.steamId === player.steamId) {
          player.lastBanDate = null;
        }
      }
    })
    .addCase(deleteIgnoredSteamAccountSuccess, (state, action) => {
      for (const player of state?.players ?? []) {
        if (action.payload.account.steamId === player.steamId) {
          player.lastBanDate = action.payload.account.lastBanDate;
        }
      }
    })
    .addCase(insertMatchSuccess, (state, action) => {
      if (state?.checksum === action.payload.checksum) {
        return initialState;
      }
    })
    .addCase(steamAccountNameUpdated, (state, action) => {
      if (!state) {
        return;
      }

      const { name } = action.payload;

      for (const player of state.players) {
        if (player.steamId === action.payload.steamId) {
          player.name = name;
        }
      }

      for (const kill of state.kills) {
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

      for (const chat of state.chatMessages) {
        if (chat.senderSteamId === action.payload.steamId) {
          chat.senderName = name;
        }
      }
    });
});
