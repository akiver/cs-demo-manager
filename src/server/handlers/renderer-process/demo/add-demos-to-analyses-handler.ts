import { analysesListener } from 'csdm/server/analyses-listener';
import type { Demo } from 'csdm/common/types/demo';
import { getDemoChecksumFromDemoPath } from 'csdm/node/demo/get-demo-checksum-from-demo-path';

// The checksum of a demo depends on its file size. The demos list in the renderer may hold a checksum computed while
// the file was still being written (e.g. a demo downloaded into the current folder), which doesn't match the one the
// analyzer will compute on the complete file. The match would then be inserted under a checksum the renderer doesn't
// know, and a second analysis would fail with a duplicated match checksum error since the match is deleted by the
// stale checksum before insertion. Recompute it from the file right before queueing to make sure both agree.
async function refreshDemoChecksum(demo: Demo): Promise<Demo> {
  try {
    const checksum = await getDemoChecksumFromDemoPath(demo.filePath);
    if (checksum === demo.checksum) {
      return demo;
    }

    logger.warn(
      `The checksum of the demo ${demo.filePath} changed from ${demo.checksum} to ${checksum} since it has been loaded`,
    );

    return {
      ...demo,
      checksum,
    };
  } catch (error) {
    // The analysis will report the error (missing or corrupted file) through the usual path.
    logger.warn(`Unable to compute the checksum of the demo ${demo.filePath} before its analysis`);
    logger.warn(error);

    return demo;
  }
}

export async function addDemosToAnalysesHandler(demos: Demo[]) {
  // Sequential on purpose: thousands of demos may be queued at once, opening all the files concurrently could
  // exhaust the file descriptors limit.
  const demosWithCurrentChecksum: Demo[] = [];
  for (const demo of demos) {
    demosWithCurrentChecksum.push(await refreshDemoChecksum(demo));
  }

  await analysesListener.addDemosToAnalyses(demosWithCurrentChecksum);
}
