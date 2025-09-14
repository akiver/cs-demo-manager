import React from 'react';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { WEAPONS_ICONS } from 'csdm/ui/components/weapons-icons';

type Props = {
  weapons: WeaponName[];
  currentWeapon: WeaponName;
  playerName: string;
};

export function Weapons({ weapons, currentWeapon, playerName }: Props) {
  return (
    <div className="flex flex-wrap gap-x-4 opacity-50">
      {weapons
        .filter((weaponName) => weaponName !== currentWeapon)
        .map((weaponName, index) => {
          const WeaponIcon = WEAPONS_ICONS[weaponName];
          if (WeaponIcon !== undefined) {
            return (
              <div className="relative" key={`weapon-${playerName}-${weaponName}-${index}`}>
                <WeaponIcon className="h-20 fill-gray-800 stroke-gray-800" />
              </div>
            );
          }
          return null;
        })}
    </div>
  );
}
