import React from 'react';
import { BombIcon } from 'csdm/ui/icons/weapons/bomb-icon';

export function BombIndicator() {
  return (
    <div className="absolute bottom-4 left-32">
      <BombIcon className="bg-gray-75 fill-red-700" size={18} />
    </div>
  );
}
