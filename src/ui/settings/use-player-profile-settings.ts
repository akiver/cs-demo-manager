import type { PlayerProfileSettings } from 'csdm/node/settings/settings';
import { useSettings } from './use-settings';
import { useUpdateSettings } from './use-update-settings';

export function usePlayerProfileSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: async (settings: Partial<PlayerProfileSettings>) => {
      await updateSettings(
        {
          playerProfile: settings,
        },
        {
          preserveSourceArray: true,
        },
      );
    },
    demoSources: settings.playerProfile.demoSources,
    games: settings.playerProfile.games,
    gameModes: settings.playerProfile.gameModes,
    tagIds: settings.playerProfile.tagIds,
    maxRounds: settings.playerProfile.maxRounds,
    startDate: settings.playerProfile.startDate,
    endDate: settings.playerProfile.endDate,
    ranking: settings.playerProfile.ranking,
    demoTypes: settings.playerProfile.demoTypes,
  };
}
