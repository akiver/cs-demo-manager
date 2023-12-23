import React from 'react';
import { NumberBadge } from '../number-badge';

type Props = {
  number: number;
};

export function TabLinkNumberBadge({ number }: Props) {
  return (
    <div className="absolute top-0 -right-4">
      <NumberBadge number={number} />
    </div>
  );
}
