import type { TeamsSettings } from 'csdm/node/settings/settings';
import { useSettings } from 'csdm/ui/settings/use-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';

export function useTeamsSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: async (settings: Partial<TeamsSettings>) => {
      await updateSettings({
        teams: settings,
      });
    },
    startDate: settings.teams.startDate,
    endDate: settings.teams.endDate,
  };
}
