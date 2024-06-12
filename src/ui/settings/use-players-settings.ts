import type { PlayersSettings } from 'csdm/node/settings/settings';
import { useSettings } from 'csdm/ui/settings/use-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';

export function usePlayersSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: async (settings: Partial<PlayersSettings>) => {
      await updateSettings(
        {
          players: settings,
        },
        {
          preserveSourceArray: true,
        },
      );
    },
    bans: settings.players.bans,
    startDate: settings.players.startDate,
    endDate: settings.players.endDate,
    tagIds: settings.players.tagIds,
  };
}
