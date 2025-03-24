import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { useMatchesSettings } from 'csdm/ui/settings/use-matches-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function useActiveMatchesFilters() {
  const { sources, games, gameModes, ranking, tagIds, startDate, endDate, maxRounds, demoTypes } = useMatchesSettings();

  const hasActiveSourcesFilter = !areArraysValuesTheSame(defaultSettings.matches.demoSources, sources);
  const hasActiveGameModesFilter = !areArraysValuesTheSame(defaultSettings.matches.gameModes, gameModes);
  const hasActiveDemoTypesFilter = !areArraysValuesTheSame(defaultSettings.matches.demoTypes, demoTypes);
  const hasActiveGamesFilter = !areArraysValuesTheSame(defaultSettings.matches.games, games);
  const hasActiveTagsFilter = !areArraysValuesTheSame(defaultSettings.matches.tagIds, tagIds);
  const hasActiveGameLengthFilter = !areArraysValuesTheSame(defaultSettings.matches.maxRounds, maxRounds);
  const hasActiveRankingFilter = defaultSettings.matches.ranking !== ranking;
  const hasActivePeriodFilter =
    defaultSettings.matches.startDate !== startDate || defaultSettings.matches.endDate !== endDate;

  const hasActiveFilter =
    hasActiveGamesFilter ||
    hasActiveSourcesFilter ||
    hasActiveGameModesFilter ||
    hasActiveDemoTypesFilter ||
    hasActiveTagsFilter ||
    hasActiveGameLengthFilter ||
    hasActiveRankingFilter ||
    hasActivePeriodFilter;

  return {
    hasActiveFilter,
    hasActiveGamesFilter,
    hasActiveSourcesFilter,
    hasActiveGameModesFilter,
    hasActiveDemoTypesFilter,
    hasActiveTagsFilter,
    hasActiveGameLengthFilter,
  };
}
