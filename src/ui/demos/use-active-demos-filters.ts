import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { useDemosSettings } from 'csdm/ui/settings/use-demos-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function useActiveDemosFilters() {
  const { sources, types, games, tagIds, startDate, endDate, analysisStatus } = useDemosSettings();

  const hasActiveSourcesFilter = !areArraysValuesTheSame(defaultSettings.demos.sources, sources);
  const hasActiveTypesFilter = !areArraysValuesTheSame(defaultSettings.demos.types, types);
  const hasActiveGamesFilter = !areArraysValuesTheSame(defaultSettings.demos.games, games);
  const hasActiveTagsFilter = !areArraysValuesTheSame(defaultSettings.demos.tagIds, tagIds);
  const hasActivePeriodFilter =
    defaultSettings.demos.startDate !== startDate || defaultSettings.demos.endDate !== endDate;
  const hasActiveAnalysisStatusFilter = defaultSettings.demos.analysisStatus !== analysisStatus;

  const hasActiveFilter =
    hasActiveSourcesFilter ||
    hasActiveTypesFilter ||
    hasActiveTagsFilter ||
    hasActivePeriodFilter ||
    hasActiveAnalysisStatusFilter;

  return {
    hasActiveFilter,
    hasActiveSourcesFilter,
    hasActiveTagsFilter,
    hasActiveTypesFilter,
    hasActiveGamesFilter,
  };
}
