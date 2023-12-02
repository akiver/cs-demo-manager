import { useSelector } from 'csdm/ui/store/use-selector';
import type { BootstrapState } from './bootstrap-reducer';

export function useBootstrapState(): BootstrapState {
  const bootstrapState = useSelector((state) => state.bootstrap);

  return bootstrapState;
}
