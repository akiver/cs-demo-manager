import { combineReducers } from '@reduxjs/toolkit';
import { hlaeReducer } from 'csdm/ui/match/video/hlae/hlae-reducer';
import { virtualDubReducer } from 'csdm/ui/match/video/virtualdub/virtual-dub-reducer';
import { sequencesReducer } from 'csdm/ui/match/video/sequences/sequences-reducer';
import { ffmpegReducer } from './ffmpeg/ffmpeg-reducer';

export const videoReducer = combineReducers({
  hlae: hlaeReducer,
  virtualDub: virtualDubReducer,
  ffmpeg: ffmpegReducer,
  sequencesByDemoFilePath: sequencesReducer,
});
