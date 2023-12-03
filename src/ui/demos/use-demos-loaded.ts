import { Status } from 'csdm/common/types/status';
import { useDemosStatus } from './use-demos-status';

export function useDemosLoaded() {
  const status = useDemosStatus();

  return status !== Status.Idle && status !== Status.Loading;
}
