import { ServerPushMessageName } from 'csdm/server/messages/server-push-message-name';
import { server } from 'csdm/server/server';
import { getErrorCodeFromError } from 'csdm/server/get-error-code-from-error';
import { fetchLastValveMatches } from 'csdm/node/valve-match/fetch-last-valve-matches';

export async function fetchLastValveMatchesHandler() {
  try {
    server.sendPushMessage({
      name: ServerPushMessageName.FetchLastValveMatchesStart,
    });

    const onSteamIdDetected = (steamId: string) => {
      server.sendPushMessage({
        name: ServerPushMessageName.FetchLastValveMatchesSteamIdDetected,
        payload: steamId,
      });
    };
    const matches = await fetchLastValveMatches(onSteamIdDetected);

    server.sendPushMessage({
      name: ServerPushMessageName.FetchLastValveMatchesSuccess,
      payload: matches,
    });
  } catch (error) {
    logger.error('Error while fetching last Valve matches');
    logger.error(error);
    const errorCode = getErrorCodeFromError(error);
    server.sendPushMessage({
      name: ServerPushMessageName.FetchLastValveMatchesError,
      payload: errorCode,
    });
  }
}
