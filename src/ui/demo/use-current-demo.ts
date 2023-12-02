import type { Demo } from 'csdm/common/types/demo';
import { useDemoState } from './use-demo-state';

export function useCurrentDemo(): Demo {
  const demoState = useDemoState();
  if (!demoState.demo) {
    throw new Error('Demo not defined in state');
  }

  return demoState.demo;
}
