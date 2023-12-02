import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { defaultSettings } from 'csdm/node/settings/default-settings';
import { usePlayerProfileSettings } from '../settings/use-player-profile-settings';

export function useActivePlayerFilters() {
  const { demoSources, games, gameModes, demoTypes, ranking, tagIds, maxRounds, startDate, endDate } =
    usePlayerProfileSettings();

  const hasActiveSourcesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.demoSources, demoSources);
  const hasActiveGamesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.games, games);
  const hasActiveGameModesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.gameModes, gameModes);
  const hasActiveDemoTypesFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.demoTypes, demoTypes);
  const hasActiveTagsFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.tagIds, tagIds);
  const hasActiveGameLengthFilter = !areArraysValuesTheSame(defaultSettings.playerProfile.maxRounds, maxRounds);
  const hasActiveRankingFilter = defaultSettings.playerProfile.ranking !== ranking;
  const hasActivePeriodFilter =
    defaultSettings.playerProfile.startDate !== startDate || defaultSettings.playerProfile.endDate !== endDate;

  const hasActiveFilter =
    hasActiveSourcesFilter ||
    hasActiveGamesFilter ||
    hasActiveGameModesFilter ||
    hasActiveDemoTypesFilter ||
    hasActiveTagsFilter ||
    hasActiveGameLengthFilter ||
    hasActiveRankingFilter ||
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
