import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { defaultSettings } from 'csdm/node/settings/default-settings';
import { useTeamProfileSettings } from '../settings/use-team-profile-settings';

export function useActiveTeamFilters() {
  const { demoSources, games, gameModes, demoTypes, tagIds, maxRounds, startDate, endDate } = useTeamProfileSettings();

  const hasActiveSourcesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.demoSources, demoSources);
  const hasActiveGamesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.games, games);
  const hasActiveGameModesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.gameModes, gameModes);
  const hasActiveDemoTypesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.demoTypes, demoTypes);
  const hasActiveTagsFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.tagIds, tagIds);
  const hasActiveGameLengthFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.maxRounds, maxRounds);
  const hasActivePeriodFilter =
    defaultSettings.playerProfile.startDate !== startDate || defaultSettings.playerProfile.endDate !== endDate;

  const hasActiveFilter =
    hasActiveSourcesFilter ||
    hasActiveGamesFilter ||
    hasActiveGameModesFilter ||
    hasActiveDemoTypesFilter ||
    hasActiveTagsFilter ||
    hasActiveGameLengthFilter ||
    hasActivePeriodFilter;

  return {
    hasActiveFilter,
    hasActiveSourcesFilter,
    hasActiveGamesFilter,
    hasActiveDemoTypesFilter,
    hasActiveGameModesFilter,
    hasActiveTagsFilter,
    hasActiveGameLengthFilter,
  };
}
