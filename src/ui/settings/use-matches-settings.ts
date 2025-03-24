import type { MatchesSettings } from 'csdm/node/settings/settings';
import { useSettings } from './use-settings';
import { useUpdateSettings } from './use-update-settings';

export function useMatchesSettings() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  return {
    updateSettings: async (settings: Partial<MatchesSettings>) => {
      await updateSettings(
        {
          matches: settings,
        },
        {
          preserveSourceArray: true,
        },
      );
    },
    sources: settings.matches.demoSources,
    games: settings.matches.games,
    gameModes: settings.matches.gameModes,
    tagIds: settings.matches.tagIds,
    maxRounds: settings.matches.maxRounds,
    startDate: settings.matches.startDate,
    endDate: settings.matches.endDate,
    ranking: settings.matches.ranking,
    demoTypes: settings.matches.demoTypes,
  };
}
