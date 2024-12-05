import { createReducer } from '@reduxjs/toolkit';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import type { Video } from 'csdm/common/types/video';
import {
  pauseQueue,
  removeCompletedVideos,
  resumeQueue,
  videoAddedToQueue,
  videosRemovedFromQueue,
  videoUpdated,
} from './videos-actions';
import { VideoStatus } from 'csdm/common/types/video-status';

export type VideosState = {
  readonly videos: Video[];
  readonly isPaused: boolean;
};

const initialState: VideosState = {
  videos: [],
  isPaused: true,
};

export const videosReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(videoAddedToQueue, (state, action) => {
      if (action.payload.id) {
        const videoIndex = state.videos.findIndex((video) => video.id === action.payload.id);
        if (videoIndex > -1) {
          state.videos[videoIndex] = action.payload;
          return;
        }
      }

      state.videos.push(action.payload);
    })
    .addCase(videoUpdated, (state, action) => {
      const videoIndex = state.videos.findIndex((analysis) => {
        return analysis.id === action.payload.id;
      });
      if (videoIndex > -1) {
        state.videos[videoIndex] = action.payload;
      }
    })
    .addCase(videosRemovedFromQueue, (state, action) => {
      state.videos = state.videos.filter((analysis) => {
        return !action.payload.includes(analysis.id);
      });
    })
    .addCase(removeCompletedVideos, (state) => {
      state.videos = state.videos.filter((analysis) => {
        return analysis.status !== VideoStatus.Error && analysis.status !== VideoStatus.Success;
      });
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.videos = action.payload.videos;
    })
    .addCase(resumeQueue, (state) => {
      state.isPaused = false;
    })
    .addCase(pauseQueue, (state) => {
      state.isPaused = true;
    });
});
