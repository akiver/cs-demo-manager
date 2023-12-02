import { Status } from 'csdm/common/types/status';
import { useMatchesStatus } from './use-matches-status';

export function useMatchesLoaded() {
  const status = useMatchesStatus();

  return status === Status.Success;
}
