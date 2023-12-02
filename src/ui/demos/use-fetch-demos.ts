import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { fetchDemosError, fetchDemosProgress, fetchDemosStart, fetchDemosSuccess } from 'csdm/ui/demos/demos-actions';
import { useDemosSettings } from 'csdm/ui/settings/use-demos-settings';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';

export function useFetchDemos() {
  const client = useWebSocketClient();
  const dispatch = useDispatch();
  const { updateSettings, sources, types, games, tagIds, startDate, endDate, analysisStatus } = useDemosSettings();

  return async (options?: Partial<DemosTableFilter>) => {
    try {
      client.on(RendererServerMessageName.FetchDemosProgress, (payload) => {
        dispatch(fetchDemosProgress(payload));
      });

      const filter: DemosTableFilter = {
        sources: options?.sources ?? sources,
        types: options?.types ?? types,
        games: options?.games ?? games,
        tagIds: options?.tagIds ?? tagIds,
        startDate: options && 'startDate' in options ? options.startDate : startDate,
        endDate: options && 'endDate' in options ? options.endDate : endDate,
        analysisStatus: options?.analysisStatus ?? analysisStatus,
      };
      dispatch(fetchDemosStart());
      const demos = await client.send({
        name: RendererClientMessageName.FetchDemosTable,
        payload: filter,
      });
      updateSettings({
        sources: options?.sources ?? sources,
        types: options?.types ?? types,
        games: options?.games ?? games,
        tagIds: options?.tagIds ?? tagIds,
        startDate: options && 'startDate' in options ? options.startDate : startDate,
        endDate: options && 'endDate' in options ? options.endDate : endDate,
      });
      dispatch(fetchDemosSuccess(demos));
    } catch (error) {
      dispatch(fetchDemosError());
    } finally {
      client.removeAllEventListeners(RendererServerMessageName.FetchDemosProgress);
    }
  };
}
