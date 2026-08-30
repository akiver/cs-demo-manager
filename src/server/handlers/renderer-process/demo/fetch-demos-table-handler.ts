import type { Demo } from 'csdm/common/types/demo';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';
import { fetchDemosTable } from 'csdm/node/database/demos/fetch-demos-table';
import { fetchMatchChecksums } from 'csdm/node/database/matches/fetch-match-checksums';
import { server } from 'csdm/server/server';
import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { handleError } from '../../handle-error';

export type FetchDemosTableResponse = {
  demos: Demo[];
  // The match checksums are included so the renderer process can refresh its cache: the database may have been
  // modified by another process (e.g. a CLI analysis) since the application started.
  matchChecksums: string[];
};

export async function fetchDemosTableHandler(filter: DemosTableFilter): Promise<FetchDemosTableResponse> {
  try {
    const demos = await fetchDemosTable(filter, {
      onProgress: (progress) => {
        server.sendPushMessage({
          name: ServerPushMessageName.FetchDemosProgress,
          payload: progress,
        });
      },
    });
    const matchChecksums = await fetchMatchChecksums();

    return { demos, matchChecksums };
  } catch (error) {
    return handleError(error, 'Error while fetching demos table');
  }
}
