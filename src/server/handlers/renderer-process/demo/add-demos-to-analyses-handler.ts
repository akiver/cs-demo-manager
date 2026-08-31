import { analysesListener } from 'csdm/server/analyses-listener';
import type { Demo } from 'csdm/common/types/demo';
import { buildDatabaseOperationError, type DatabaseOperationError } from 'csdm/server/database-operation-error';

export async function addDemosToAnalysesHandler(demos: Demo[]): Promise<DatabaseOperationError | undefined> {
  try {
    await analysesListener.addDemosToAnalyses(demos);
    return undefined;
  } catch (error) {
    return buildDatabaseOperationError(error);
  }
}
