import { useSelector } from 'csdm/ui/store/use-selector';
import type { BanState } from './ban-reducer';

export function useBanState(): BanState {
  return useSelector((state) => state.ban);
}
