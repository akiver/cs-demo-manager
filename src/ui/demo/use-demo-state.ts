import { useSelector } from 'csdm/ui/store/use-selector';
import type { DemoState } from './demo-reducer';

export function useDemoState(): DemoState {
  const demoState = useSelector((state) => state.demo);

  return demoState;
}
