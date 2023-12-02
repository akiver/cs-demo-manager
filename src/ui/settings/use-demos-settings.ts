import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import type { DemosTableFilter } from 'csdm/node/database/demos/demos-table-filter';
import { useSettings } from 'csdm/ui/settings/use-settings';

export function useDemosSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: (filters?: Partial<DemosTableFilter>) => {
      return updateSettings(
        {
          demos: filters,
        },
        {
          preserveSourceArray: true,
        },
      );
    },
    sources: settings.demos.sources,
    types: settings.demos.types,
    games: settings.demos.games,
    startDate: settings.demos.startDate,
    endDate: settings.demos.endDate,
    tagIds: settings.demos.tagIds,
    analysisStatus: settings.demos.analysisStatus,
  };
}
