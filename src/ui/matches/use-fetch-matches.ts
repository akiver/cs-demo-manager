import type { FetchMatchesTablePayload } from 'csdm/server/handlers/renderer-process/match/fetch-matches-table-handler';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { fetchMatchesError, fetchMatchesStart, fetchMatchesSuccess } from './matches-actions';
import { useMatchesSettings } from 'csdm/ui/settings/use-matches-settings';

export function useFetchMatches() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const { updateSettings, sources, games, gameModes, ranking, startDate, endDate, tagIds, maxRounds, demoTypes } =
    useMatchesSettings();

  return async (options?: Partial<FetchMatchesTablePayload>) => {
    try {
      const payload: FetchMatchesTablePayload = {
        demoSources: options?.demoSources ?? sources,
        games: options?.games ?? games,
        gameModes: options?.gameModes ?? gameModes,
        demoTypes: options?.demoTypes ?? demoTypes,
        ranking: options?.ranking ?? ranking,
        tagIds: options?.tagIds ?? tagIds,
        maxRounds: options?.maxRounds ?? maxRounds,
        startDate: options && 'startDate' in options ? options.startDate : startDate,
        endDate: options && 'endDate' in options ? options.endDate : endDate,
      };
      dispatch(fetchMatchesStart());
      await updateSettings(payload);
      const matches = await client.send({ name: RendererClientMessageName.FetchMatchesTable, payload });
      dispatch(
        fetchMatchesSuccess({
          matches,
        }),
      );
    } catch (error) {
      dispatch(fetchMatchesError());
    }
  };
}
