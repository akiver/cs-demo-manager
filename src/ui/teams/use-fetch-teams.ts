import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useTeamsSettings } from 'csdm/ui/settings/use-teams-settings';
import type { TeamsTableFilter } from 'csdm/node/database/teams/teams-table-filter';
import { fetchTeamsError, fetchTeamsStart, fetchTeamsSuccess } from './teams-actions';

export function useFetchTeams() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const { updateSettings, startDate, endDate } = useTeamsSettings();

  return async (options?: Partial<TeamsTableFilter>) => {
    try {
      const payload: TeamsTableFilter = {
        startDate: options && 'startDate' in options ? options.startDate : startDate,
        endDate: options && 'endDate' in options ? options.endDate : endDate,
      };
      dispatch(fetchTeamsStart({ filter: payload }));
      await updateSettings(payload);
      const teams = await client.send({
        name: RendererClientMessageName.FetchTeamsTable,
        payload,
      });
      dispatch(fetchTeamsSuccess({ teams }));
    } catch (error) {
      dispatch(fetchTeamsError());
    }
  };
}
