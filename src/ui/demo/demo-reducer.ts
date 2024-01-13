import { createReducer } from '@reduxjs/toolkit';
import { commentUpdated } from 'csdm/ui/comment/comment-actions';
import { deleteDemosSuccess, demoRenamed, demosSourceUpdated, demosTypeUpdated } from 'csdm/ui/demos/demos-actions';
import { checksumsTagsUpdated } from 'csdm/ui/tags/tags-actions';
import type { Demo } from 'csdm/common/types/demo';
import type { ValvePlayer } from 'csdm/common/types/valve-match';
import { loadDemoSuccess, selectPlayer } from './demo-actions';
import { insertMatchSuccess } from '../analyses/analyses-actions';

const getPlayerWithBestScore = (players: ValvePlayer[]) => {
  let playerWithBestScore: ValvePlayer | undefined;
  let bestScore = -1;
  for (const player of players) {
    if (player.score > bestScore) {
      playerWithBestScore = player;
      bestScore = player.score;
    }
  }

  return playerWithBestScore;
};

export type DemoState = {
  demo?: Demo;
  selectedPlayer?: ValvePlayer;
};

const initialState: DemoState = {};

export const demoReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(loadDemoSuccess, (state, action) => {
      const { valveMatch } = action.payload;
      let selectedPlayer: ValvePlayer | undefined;
      if (valveMatch !== undefined) {
        selectedPlayer = getPlayerWithBestScore(valveMatch.players);
      }

      return {
        demo: action.payload,
        selectedPlayer,
      };
    })
    .addCase(selectPlayer, (state, action) => {
      state.selectedPlayer = action.payload;
    })
    .addCase(commentUpdated, (state, action) => {
      if (state.demo?.checksum === action.payload.checksum) {
        state.demo.comment = action.payload.comment;
      }
    })
    .addCase(demoRenamed, (state, action) => {
      if (state.demo?.checksum === action.payload.checksum) {
        state.demo.name = action.payload.name;
      }
    })
    .addCase(checksumsTagsUpdated, (state, action) => {
      if (state.demo !== undefined && action.payload.checksums.includes(state.demo.checksum)) {
        state.demo.tagIds = action.payload.tagIds;
      }
    })
    .addCase(deleteDemosSuccess, (state, action) => {
      const deletedDemos = action.payload;
      if (state.demo && deletedDemos.includes(state.demo.filePath)) {
        state.demo = undefined;
      }
      state.selectedPlayer = undefined;
    })
    .addCase(demosSourceUpdated, (state, action) => {
      if (state.demo !== undefined && action.payload.checksums.includes(state.demo.checksum)) {
        state.demo.source = action.payload.source;
      }
    })
    .addCase(demosTypeUpdated, (state, action) => {
      if (state.demo !== undefined && action.payload.checksums.includes(state.demo.checksum)) {
        state.demo.type = action.payload.type;
      }
    })
    .addCase(insertMatchSuccess, (state, action) => {
      if (state.demo && state.demo.checksum === action.payload.checksum) {
        state.demo = {
          ...state.demo,
          ...action.payload,
        };
      }
    });
});
