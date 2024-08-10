import { createAction } from '@reduxjs/toolkit';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { PlayerSequenceEvent } from './player-sequence-event';
import type { WeaponName } from 'csdm/common/types/counter-strike';

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
export const generatePlayerSequences = createAction<{
  steamId: string;
  match: Match;
  event: PlayerSequenceEvent;
  weapons: WeaponName[];
}>('match/video/sequences/generatePlayerSequences');
export const generatePlayerKillsSequences = createAction<{ steamId: string; match: Match }>(
  'match/video/sequences/generatePlayerKills',
);
export const generatePlayerDeathsSequences = createAction<{ steamId: string; match: Match }>(
  'match/video/sequences/generatePlayerDeaths',
);
export const generatePlayerRoundsSequences = createAction<{ steamId: string; match: Match }>(
  'match/video/sequences/generatePlayerRounds',
);
