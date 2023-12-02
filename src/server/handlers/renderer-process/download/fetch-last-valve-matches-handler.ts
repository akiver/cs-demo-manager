import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { server } from 'csdm/server/server';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { fetchLastValveMatches } from 'csdm/node/valve-match/fetch-last-valve-matches';

export async function fetchLastValveMatchesHandler() {
  try {
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesStart,
    });

    const onSteamIdDetected = (steamId: string) => {
      server.sendMessageToRendererProcess({
        name: RendererServerMessageName.FetchLastValveMatchesSteamIdDetected,
        payload: steamId,
      });
    };
    const matches = await fetchLastValveMatches(onSteamIdDetected);

    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesSuccess,
      payload: matches,
    });
  } catch (error) {
    logger.error('Error while fetching last Valve matches');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    server.sendMessageToRendererProcess({
      name: RendererServerMessageName.FetchLastValveMatchesError,
      payload: errorCode,
    });
  }
}
