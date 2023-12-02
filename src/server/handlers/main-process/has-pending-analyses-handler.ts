import { analysesListener } from 'csdm/server/analyses-listener';

export async function hasPendingAnalysesHandler() {
  return Promise.resolve(analysesListener.hasAnalysesInProgress());
}
