import type { DemoSource } from 'csdm/common/types/counter-strike';
import type { Demo } from 'csdm/common/types/demo';
import type { HandlerContext } from 'csdm/server/messages/handler';
import { getDemoFromFilePath } from 'csdm/node/demo/get-demo-from-file-path';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { analysesListener } from 'csdm/server/analyses-listener';
import { ensureDatabaseConnection } from 'csdm/server/ensure-database-connection';
import { handleError } from '../handle-error';

export type AddDemoPathsToAnalysesPayload = {
  demoPaths: string[];
  force: boolean;
  analyzePositions: boolean;
  source?: DemoSource;
};

export type AddDemoPathsToAnalysesResult = {
  addedDemos: { checksum: string; demoPath: string }[];
  skippedDemoPaths: string[];
};

export async function addDemoPathsToAnalysesHandler(
  payload: AddDemoPathsToAnalysesPayload,
  context?: HandlerContext,
): Promise<AddDemoPathsToAnalysesResult> {
  try {
    await ensureDatabaseConnection();
    const checksums = await fetchMatchChecksums();
    const demos: Demo[] = [];
    const addedDemos: AddDemoPathsToAnalysesResult['addedDemos'] = [];
    const skippedDemoPaths: string[] = [];
    for (const demoPath of payload.demoPaths) {
      const demo = await getDemoFromFilePath(demoPath);
      if (payload.source !== undefined) {
        demo.source = payload.source;
      }
      if (!payload.force && checksums.includes(demo.checksum)) {
        skippedDemoPaths.push(demoPath);
        continue;
      }
      // The same demo may be given several times (duplicated path argument or identical copies in different folders),
      // queue it only once.
      const isDuplicate = addedDemos.some((addedDemo) => addedDemo.checksum === demo.checksum);
      if (isDuplicate) {
        continue;
      }
      demos.push(demo);
      // Demos already in the pending analyses are reported as added: the CLI tracks their completion through the
      // AnalysisUpdated push messages, whether they were queued by the CLI or the GUI.
      addedDemos.push({ checksum: demo.checksum, demoPath });
    }

    // ! Not awaited: it would resolve only once the whole analyses queue completed and the CLI request would
    // time out. The CLI tracks completion through the AnalysisUpdated push messages.
    void analysesListener.addDemosToAnalyses(demos, {
      analyzePositions: payload.analyzePositions,
      clientId: context?.clientId,
    });

    return { addedDemos, skippedDemoPaths };
  } catch (error) {
    return handleError(error, 'Error while adding demo paths to analyses');
  }
}
