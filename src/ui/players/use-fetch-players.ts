import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { fetchPlayersError, fetchPlayersStart, fetchPlayersSuccess } from 'csdm/ui/players/players-actions';
import type { PlayersTableFilter } from 'csdm/node/database/players/players-table-filter';
import { usePlayersSettings } from 'csdm/ui/settings/use-players-settings';

export function useFetchPlayers() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const { updateSettings, bans, startDate, endDate, tagIds } = usePlayersSettings();

  return async (options?: Partial<PlayersTableFilter>) => {
    try {
      const payload: PlayersTableFilter = {
        bans: options?.bans ?? bans,
        startDate: options && 'startDate' in options ? options.startDate : startDate,
        endDate: options && 'endDate' in options ? options.endDate : endDate,
        tagIds: options?.tagIds ?? tagIds,
      };
      dispatch(fetchPlayersStart({ filter: payload }));
      await updateSettings(payload);
      const players = await client.send({
        name: RendererClientMessageName.FetchPlayersTable,
        payload,
      });
      dispatch(fetchPlayersSuccess({ players }));
    } catch (error) {
      dispatch(fetchPlayersError());
    }
  };
}
