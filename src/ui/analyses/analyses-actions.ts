import { createAction } from '@reduxjs/toolkit';
import type { MatchTable } from 'csdm/common/types/match-table';
import type { Analysis } from 'csdm/common/types/analysis';

export const demosAddedToAnalyses = createAction<Analysis[]>('analyses/demosAdded');
export const demoRemovedFromAnalyses = createAction<string[]>('analyses/demosRemoved');
export const analysisUpdated = createAction<Analysis>('analyses/updated');
export const insertMatchSuccess = createAction<MatchTable>('analyses/insertMatchSuccess');
export const analysisSelected = createAction<Analysis>('analyses/analysisSelected');
