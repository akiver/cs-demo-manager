import type { GrenadeThrow } from 'csdm/common/types/grenade-throw';
import { useSelectedGrenadeName } from './use-selected-grenade-name';
import { useSelectedRounds } from './use-selected-rounds';
import { useSelectedSides } from './use-selected-sides';
import { useSelectedSteamIds } from './use-selected-steamids';

export function useFilteredGrenadesThrow(grenadesThrow: GrenadeThrow[]) {
  const selectedRounds = useSelectedRounds();
  const selectedGrenadeName = useSelectedGrenadeName();
  const selectedSteamIds = useSelectedSteamIds();
  const selectedSides = useSelectedSides();

  let filteredGrenadesThrow: GrenadeThrow[] = grenadesThrow.filter((grenadeThrow) => {
    return grenadeThrow.grenadeName === selectedGrenadeName;
  });

  if (selectedSteamIds.length > 0) {
    filteredGrenadesThrow = filteredGrenadesThrow.filter((grenadeThrow) => {
      return selectedSteamIds.includes(grenadeThrow.throwerSteamId);
    });
  }

  if (selectedRounds.length > 0) {
    filteredGrenadesThrow = filteredGrenadesThrow.filter((grenadeThrow) => {
      return selectedRounds.includes(grenadeThrow.roundNumber);
    });
  }

  if (selectedSides.length > 0) {
    filteredGrenadesThrow = filteredGrenadesThrow.filter((grenadeThrow) => {
      return selectedSides.includes(grenadeThrow.throwerSide);
    });
  }

  return filteredGrenadesThrow;
}
