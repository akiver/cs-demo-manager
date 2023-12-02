import { useSelector } from 'csdm/ui/store/use-selector';
import type { AnalysesState } from './analyses-reducer';

export function useAnalysesState(): AnalysesState {
  const analysesState = useSelector((state) => state.analyses);

  return analysesState;
}
