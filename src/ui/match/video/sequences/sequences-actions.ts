import { createAction } from '@reduxjs/toolkit';
import type { Sequence } from 'csdm/common/types/sequence';
import type { Match } from 'csdm/common/types/match';
import type { Perspective } from 'csdm/common/types/perspective';
import type { WeaponName } from '@akiver/cs-demo-analyzer';
import type { VideoSettings } from 'csdm/node/settings/settings';

export type GeneratePlayersEventPayload = {
  steamIds: string[];
  match: Match;
  rounds: number[];
  perspective: Perspective;
  weapons: WeaponName[];
  settings: VideoSettings;
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  preserveExistingSequences: boolean;
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
export const generatePlayersKillsSequences = createAction<GeneratePlayersEventPayload>(
  'match/video/sequences/generatePlayersKills',
);
export const generatePlayersDeathsSequences = createAction<GeneratePlayersEventPayload>(
  'match/video/sequences/generatePlayersDeaths',
);
export const generatePlayersRoundsSequences = createAction<{
  steamIds: string[];
  match: Match;
  startSecondsBeforeEvent: number;
  endSecondsAfterEvent: number;
  settings: VideoSettings;
  rounds: number[];
  preserveExistingSequences: boolean;
}>('match/video/sequences/generatePlayersRounds');
