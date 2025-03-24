import type { ErrorCode } from 'csdm/common/error-code';
import type { TeamFilters } from 'csdm/node/database/team/team-filters';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { useWebSocketClient } from '../hooks/use-web-socket-client';
import { useTeamProfileSettings } from '../settings/use-team-profile-settings';
import { useDispatch } from '../store/use-dispatch';
import { fetchTeamError, fetchTeamStart, fetchTeamSuccess } from './team-actions';
import { useCurrentTeamName } from './use-current-team-name';

export function useFetchTeam() {
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const teamName = useCurrentTeamName();
  const { updateSettings, demoSources, games, demoTypes, gameModes, tagIds, maxRounds, startDate, endDate } =
    useTeamProfileSettings();

  return async (filters?: Partial<TeamFilters>) => {
    try {
      const payload: TeamFilters = {
        name: teamName,
        startDate,
        endDate,
        demoSources,
        games,
        demoTypes,
        gameModes,
        tagIds,
        maxRounds,
        ...filters,
      };
      dispatch(fetchTeamStart());
      await updateSettings({
        demoSources: filters?.demoSources ?? demoSources,
        games: filters?.games ?? games,
        gameModes: filters?.gameModes ?? gameModes,
        demoTypes: filters?.demoTypes ?? demoTypes,
        tagIds: filters?.tagIds ?? tagIds,
        maxRounds: filters?.maxRounds ?? maxRounds,
        startDate: filters && 'startDate' in filters ? filters.startDate : startDate,
        endDate: filters && 'endDate' in filters ? filters.endDate : endDate,
      });

      const team = await client.send({
        name: RendererClientMessageName.FetchTeam,
        payload,
      });
      dispatch(fetchTeamSuccess(team));
    } catch (error) {
      dispatch(fetchTeamError({ errorCode: error as ErrorCode }));
    }
  };
}
