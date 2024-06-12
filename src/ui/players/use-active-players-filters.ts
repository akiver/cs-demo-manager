import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { usePlayersSettings } from 'csdm/ui/settings/use-players-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function useActivePlayersFilters() {
  const { bans, startDate, endDate, tagIds } = usePlayersSettings();
  const hasActiveBanFilters = !areArraysValuesTheSame(defaultSettings.players.bans, bans);
  const hasActiveTagsFilter = !areArraysValuesTheSame(defaultSettings.demos.tagIds, tagIds);
  const hasActivePeriodFilter =
    defaultSettings.players.startDate !== startDate || defaultSettings.players.endDate !== endDate;

  return {
    hasActiveFilter: hasActiveBanFilters || hasActivePeriodFilter,
    hasActiveBanFilters,
    hasActiveTagsFilter,
  };
}
