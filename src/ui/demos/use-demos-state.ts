import { useSelector } from 'csdm/ui/store/use-selector';
import type { DemosState } from './demos-reducer';

export function useDemosState(): DemosState {
  const demosState = useSelector((state) => state.demos);
  return demosState;
}
