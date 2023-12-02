import { analysesListener } from 'csdm/server/analyses-listener';
import type { Demo } from 'csdm/common/types/demo';

export async function addDemosToAnalysesHandler(demos: Demo[]) {
  await analysesListener.addDemosToAnalyses(demos);
}
