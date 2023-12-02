import { useAnalysesState } from './use-analyses-state';

export function useSelectedAnalysis() {
  const state = useAnalysesState();

  return state.analyses.find((analysis) => analysis.demoPath === state.selectedDemoPath);
}
