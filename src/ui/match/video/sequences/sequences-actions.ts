import { createAction } from '@reduxjs/toolkit';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';

export const addSequence = createAction<{ demoFilePath: string; sequence: Sequence }>('match/video/sequences/add');
export const updateSequence = createAction<{ demoFilePath: string; sequence: Sequence }>(
  'match/video/sequences/update',
);
export const deleteSequence = createAction<{ demoFilePath: string; sequence: Sequence }>(
  'match/video/sequences/delete',
);
export const deleteSequences = createAction<{ demoFilePath: string }>('match/video/sequences/deleteAll');
export const generatePlayerKillsSequences = createAction<{ steamId: string; match: Match }>(
  'match/video/sequences/generatePlayerKills',
);
