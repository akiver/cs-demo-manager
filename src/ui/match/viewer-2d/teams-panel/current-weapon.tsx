import React from 'react';
import type { WeaponName } from 'csdm/common/types/counter-strike';
import { WEAPONS_ICONS } from 'csdm/ui/components/weapons-icons';

type Props = {
  weaponName: WeaponName;
};

export function CurrentWeapon({ weaponName }: Props) {
  const WeaponIcon = WEAPONS_ICONS[weaponName];
  if (WeaponIcon === undefined) {
    return null;
  }

  return (
    <div className="ml-auto flex">
      <WeaponIcon className="h-24 fill-gray-800 stroke-gray-800" />
    </div>
  );
}
