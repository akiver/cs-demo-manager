import { createReducer } from '@reduxjs/toolkit';
import type { Analysis } from 'csdm/common/types/analysis';
import { deleteMatchesSuccess } from 'csdm/ui/matches/matches-actions';
import { demosAddedToAnalyses, analysisUpdated, demoRemovedFromAnalyses, analysisSelected } from './analyses-actions';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';

export type AnalysesState = {
  readonly analyses: Analysis[];
  readonly selectedDemoPath?: string;
};

const initialState: AnalysesState = {
  analyses: [],
};

export const analysesReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(demosAddedToAnalyses, (state, action) => {
      for (const analysis of action.payload) {
        const isAlreadyAnalyzingDemo = state.analyses.some((a) => a.demoChecksum === analysis.demoChecksum);
        if (!isAlreadyAnalyzingDemo) {
          state.analyses.push(analysis);
        }
      }
    })
    .addCase(analysisUpdated, (state, action) => {
      const analysisIndex = state.analyses.findIndex((analysis) => {
        return analysis.demoChecksum === action.payload.demoChecksum;
      });
      if (analysisIndex > -1) {
        state.analyses[analysisIndex] = action.payload;
      }
    })
    .addCase(demoRemovedFromAnalyses, (state, action) => {
      state.analyses = state.analyses.filter((analysis) => {
        return !action.payload.includes(analysis.demoChecksum);
      });
      if (state.selectedDemoPath !== undefined && action.payload.includes(state.selectedDemoPath)) {
        state.selectedDemoPath = undefined;
      }
    })
    .addCase(analysisSelected, (state, action) => {
      state.selectedDemoPath = action.payload.demoPath;
    })
    .addCase(deleteMatchesSuccess, (state, { payload }) => {
      state.analyses = state.analyses.filter((analysis) => {
        return !payload.deletedChecksums.includes(analysis.demoChecksum);
      });
    })
    .addCase(initializeAppSuccess, (state, action) => {
      state.analyses = action.payload.analyses;
    });
});
