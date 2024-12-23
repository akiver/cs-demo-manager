import { createAction } from '@reduxjs/toolkit';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { Perspective } from 'csdm/common/types/perspective';
import type { WeaponName } from '@akiver/cs-demo-analyzer';

type GeneratePlayerEventPayload = {
  steamId: string;
  match: Match;
  perspective: Perspective;
  weapons: WeaponName[];
};

export const addSequence = createAction<{ demoFilePath: string; sequence: Sequence }>('match/video/sequences/add');
export const updateSequence = createAction<{ demoFilePath: string; sequence: Sequence }>(
  'match/video/sequences/update',
);
export const deleteSequence = createAction<{ demoFilePath: string; sequence: Sequence }>(
  'match/video/sequences/delete',
);
export const replaceSequences = createAction<{ demoFilePath: string; sequences: Sequence[] }>(
  'match/video/sequences/replace',
);
export const deleteSequences = createAction<{ demoFilePath: string }>('match/video/sequences/deleteAll');
export const generatePlayerKillsSequences = createAction<GeneratePlayerEventPayload>(
  'match/video/sequences/generatePlayerKills',
);
export const generatePlayerDeathsSequences = createAction<GeneratePlayerEventPayload>(
  'match/video/sequences/generatePlayerDeaths',
);
export const generatePlayerRoundsSequences = createAction<{ steamId: string; match: Match }>(
  'match/video/sequences/generatePlayerRounds',
);
