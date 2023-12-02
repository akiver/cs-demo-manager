import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';
import { fetchDemosTable } from 'csdm/node/database/demos/fetch-demos-table';
import { server } from 'csdm/server/server';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';

export async function fetchDemosTableHandler(filter: DemosTableFilter) {
  try {
    const demos = fetchDemosTable(filter, {
      onProgress: (demoLoadedCount, demoToLoadCount) => {
        server.sendMessageToRendererProcess({
          name: RendererServerMessageName.FetchDemosProgress,
          payload: {
            demoLoadedCount,
            demoToLoadCount,
          },
        });
      },
    });

    return demos;
  } catch (error) {
    logger.error('Error while fetching demos table');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    throw errorCode;
  }
}
