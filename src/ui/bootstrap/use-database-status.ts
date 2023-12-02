import type { DatabaseStatus } from './database-status';
import { useBootstrapState } from './use-bootstrap-state';

export function useDatabaseStatus(): DatabaseStatus {
  const state = useBootstrapState();

  return state.databaseStatus;
}
