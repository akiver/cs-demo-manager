import type { TeamEconomyStats } from 'csdm/common/types/team-economy-stats';
import { fetchTeamsEconomyStats } from '../team/fetch-teams-economy-stats';

export async function fetchMatchTeamsEconomyStats(checksum: string): Promise<TeamEconomyStats[]> {
  return await fetchTeamsEconomyStats({ matchChecksum: checksum });
}
