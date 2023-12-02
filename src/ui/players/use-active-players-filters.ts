import { areArraysValuesTheSame } from 'csdm/common/array/are-arrays-values-the-same';
import { usePlayersSettings } from 'csdm/ui/settings/use-players-settings';
import { defaultSettings } from 'csdm/node/settings/default-settings';

export function useActivePlayersFilters() {
  const { bans } = usePlayersSettings();
  const hasActiveBanFilters = !areArraysValuesTheSame(defaultSettings.players.bans, bans);

  return {
    hasActiveFilter: hasActiveBanFilters,
    hasActiveBanFilters,
  };
}
