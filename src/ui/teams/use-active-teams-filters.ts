import { useTeamsSettings } from 'csdm/ui/settings/use-teams-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function useActiveTeamsFilters() {
  const { startDate, endDate } = useTeamsSettings();
  const hasActivePeriodFilter =
    defaultSettings.players.startDate !== startDate || defaultSettings.players.endDate !== endDate;

  return {
    hasActiveFilter: hasActivePeriodFilter,
  };
}
