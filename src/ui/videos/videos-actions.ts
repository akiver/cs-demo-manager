import { createAction } from '@reduxjs/toolkit';
import type { Video } from 'csdm/common/types/video';

export const videoAddedToQueue = createAction<Video>('videos/added');
export const videosRemovedFromQueue = createAction<string[]>('videos/removed');
export const videoUpdated = createAction<Video>('videos/updated');
export const removeCompletedVideos = createAction('videos/removeCompleted');
export const resumeQueue = createAction('videos/resume');
export const pauseQueue = createAction('videos/pause');
