import type { TeamEconomyStats } from 'csdm/common/types/team-economy-stats';
import { fetchTeamsEconomyStats } from './fetch-teams-economy-stats';
import type { TeamFilters } from './team-filters';

export async function fetchTeamEconomyStats(filters: TeamFilters): Promise<TeamEconomyStats> {
  const rows = await fetchTeamsEconomyStats(
    {
      teamName: filters.name,
    },
    filters,
  );

  if (rows.length === 0) {
    return {
      teamName: filters.name,
      ecoCount: 0,
      ecoLostCount: 0,
      ecoWonCount: 0,
      ecoLostAsCtCount: 0,
      ecoLostAsTCount: 0,
      ecoWonAsCtCount: 0,
      ecoWonAsTCount: 0,
      forceBuyCount: 0,
      forceBuyLostCount: 0,
      forceBuyWonCount: 0,
      forceBuyLostAsCtCount: 0,
      forceBuyLostAsTCount: 0,
      forceBuyWonAsCtCount: 0,
      forceBuyWonAsTCount: 0,
      semiCount: 0,
      semiLostCount: 0,
      semiWonCount: 0,
      semiLostAsCtCount: 0,
      semiLostAsTCount: 0,
      semiWonAsCtCount: 0,
      semiWonAsTCount: 0,
      fullCount: 0,
      fullLostCount: 0,
      fullWonCount: 0,
      fullLostAsCtCount: 0,
      fullLostAsTCount: 0,
      fullWonAsCtCount: 0,
      fullWonAsTCount: 0,
      pistolCount: 0,
      pistolLostCount: 0,
      pistolWonCount: 0,
      pistolLostAsCtCount: 0,
      pistolLostAsTCount: 0,
      pistolWonAsCtCount: 0,
      pistolWonAsTCount: 0,
    };
  }

  return rows[0];
}
